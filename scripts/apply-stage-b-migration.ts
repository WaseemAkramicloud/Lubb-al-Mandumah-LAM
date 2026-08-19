import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim()
        let val = trimmed.substring(idx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        process.env[key] = val
      }
    }
  })
}

// Direct Pooler Host
const host = 'aws-1-eu-west-1.pooler.supabase.com'
const port = 6543
const user = 'postgres.ykrjmctfmywhymgpkqlu'
const password = process.env.SUPABASE_DB_PASSWORD || '471817@Lam2026'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykrjmctfmywhymgpkqlu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })

// Helper to generate a safe 4-char uppercase code (excluding O, 0, I, 1, L)
const ALLOWED_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

function generateRandomSuffix(): string {
  let result = ''
  for (let i = 0; i < 4; i++) {
    const randIndex = Math.floor(Math.random() * ALLOWED_CHARS.length)
    result += ALLOWED_CHARS[randIndex]
  }
  return result
}

async function runStageBMigration() {
  console.log('=== RUNNING STAGE B MIGRATION & BACKFILL ===')
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()
    console.log(`✅ Connected to Supabase Database on ${host}:${port}`)

    // 1. Read and execute migration SQL file
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/20260819000001_lam_central_identity_control_plane.sql')
    const migrationSql = fs.readFileSync(sqlPath, 'utf8')

    console.log('Executing DDL Migration 20260819000001_lam_central_identity_control_plane.sql...')
    await client.query(migrationSql)
    console.log('✅ DDL Migration applied successfully.')

    // Reload schema cache
    await client.query("NOTIFY pgrst, 'reload schema';")
    console.log("✅ PostgREST schema cache reloaded.")

    // 2. Perform Idempotent Backfill
    console.log('Performing backfill from legacy CRM & Customer identity tables...')

    // A. Backfill crm_companies -> lam_customer_accounts & lam_organizations
    const { data: companies } = await supabase.from('crm_companies').select('*')

    if (companies && companies.length > 0) {
      for (const comp of companies) {
        // Check if customer account already exists for this legacy company
        let { data: existingAccount } = await supabase
          .from('lam_customer_accounts')
          .select('id')
          .eq('legacy_company_id', comp.id)
          .maybeSingle()

        if (!existingAccount) {
          const accSeqRes = await client.query(`SELECT nextval('lam_customer_account_code_seq')::TEXT as seq`)
          const accSeqNum = accSeqRes.rows[0].seq
          const accountCode = `LAM-CA-${accSeqNum.padStart(6, '0')}`

          const { data: newAcc, error: accErr } = await supabase
            .from('lam_customer_accounts')
            .insert({
              customer_account_code: accountCode,
              name: comp.name,
              legal_name: comp.legal_name || comp.name,
              country: comp.country || null,
              city: comp.city || null,
              email: comp.email || null,
              phone: comp.phone || null,
              status: comp.status === 'Suspended' ? 'suspended' : 'active',
              legacy_company_id: comp.id
            })
            .select()
            .single()

          if (accErr || !newAcc) {
            console.error(`Failed to backfill customer account for ${comp.name}:`, accErr?.message)
            continue
          }
          existingAccount = newAcc
        }

        // Check if organization already exists for this legacy company
        let { data: existingOrg } = await supabase
          .from('lam_organizations')
          .select('id')
          .eq('legacy_company_id', comp.id)
          .maybeSingle()

        if (!existingAccount) continue

        if (!existingOrg) {
          const orgSeqRes = await client.query(`SELECT nextval('lam_organization_code_seq')::TEXT as seq`)
          const orgSeqNum = orgSeqRes.rows[0].seq
          const orgCode = `LAM-ORG-${orgSeqNum.padStart(6, '0')}`

          const { data: newOrg, error: orgErr } = await supabase
            .from('lam_organizations')
            .insert({
              customer_account_id: existingAccount.id,
              organization_code: orgCode,
              name: comp.name,
              legal_name: comp.legal_name || comp.name,
              status: comp.status === 'Suspended' ? 'suspended' : 'active',
              legacy_company_id: comp.id
            })
            .select()
            .single()

          if (orgErr || !newOrg) {
            console.error(`Failed to backfill organization for ${comp.name}:`, orgErr?.message)
            continue
          }
          existingOrg = newOrg
        }

        if (!existingAccount || !existingOrg) continue

        // Link legacy company record
        await supabase
          .from('crm_companies')
          .update({
            customer_account_id: existingAccount.id,
            organization_id: existingOrg.id
          })
          .eq('id', comp.id)

        // B. Backfill product entitlements -> lam_product_workspaces
        const { data: entitlements } = await supabase
          .from('customer_product_entitlements')
          .select('*')
          .eq('company_id', comp.id)

        if (entitlements && entitlements.length > 0) {
          for (const ent of entitlements) {
            let { data: existingWs } = await supabase
              .from('lam_product_workspaces')
              .select('id, workspace_code')
              .eq('organization_id', existingOrg.id)
              .eq('product_slug', ent.product_slug)
              .maybeSingle()

            if (!existingWs) {
              // Fetch product prefix
              const { data: prod } = await supabase
                .from('lam_products')
                .select('workspace_prefix')
                .eq('slug', ent.product_slug)
                .single()

              const prefix = prod?.workspace_prefix || ent.product_slug.substring(0, 3).toUpperCase()
              
              // Safely generate unique Workspace Code (PPPXXXX)
              let wsCode = ''
              let isUnique = false
              let attempts = 0

              while (!isUnique && attempts < 50) {
                attempts++
                wsCode = `${prefix}${generateRandomSuffix()}`
                const { data: dup } = await supabase
                  .from('lam_product_workspaces')
                  .select('id')
                  .ilike('workspace_code', wsCode)
                  .maybeSingle()
                if (!dup) isUnique = true
              }

              const { data: newWs, error: wsErr } = await supabase
                .from('lam_product_workspaces')
                .insert({
                  customer_account_id: existingAccount.id,
                  organization_id: existingOrg.id,
                  product_slug: ent.product_slug,
                  workspace_code: wsCode,
                  plan_tier: ent.plan_tier || 'standard',
                  max_seats: ent.max_seats || 10,
                  status: ent.status || 'active',
                  legacy_entitlement_id: ent.id,
                  expires_at: ent.expires_at || null
                })
                .select()
                .single()

              if (wsErr || !newWs) {
                console.error(`Failed to create workspace for ${ent.product_slug}:`, wsErr?.message)
                continue
              }
              existingWs = newWs
            }

            if (!existingWs) continue

            // Link entitlement and instance
            await supabase
              .from('customer_product_entitlements')
              .update({ workspace_id: existingWs.id })
              .eq('id', ent.id)

            await supabase
              .from('customer_product_instances')
              .update({ workspace_id: existingWs.id })
              .eq('company_id', comp.id)
              .eq('product_slug', ent.product_slug)
          }
        }

        // C. Backfill memberships -> lam_workspace_memberships
        const { data: memberships } = await supabase
          .from('customer_company_memberships')
          .select('*, customer:customer_identities(*)')
          .eq('company_id', comp.id)

        if (memberships && memberships.length > 0) {
          // Find all workspaces under this organization
          const { data: orgWorkspaces } = await supabase
            .from('lam_product_workspaces')
            .select('*')
            .eq('organization_id', existingOrg.id)

          if (orgWorkspaces && orgWorkspaces.length > 0) {
            for (const mem of memberships) {
              const cust = mem.customer as any
              if (!cust) continue

              // Derive default user_id (e.g. from email before @ or first_name)
              let baseUserId = cust.email ? cust.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() : 'user'
              if (!baseUserId || baseUserId.length < 2) baseUserId = 'user1'

              for (const ws of orgWorkspaces) {
                // Check if user has explicit access or is owner
                const { data: access } = await supabase
                  .from('customer_product_access')
                  .select('id')
                  .eq('customer_id', mem.customer_id)
                  .eq('company_id', comp.id)
                  .eq('product_slug', ws.product_slug)
                  .maybeSingle()

                if (access || mem.company_role === 'owner') {
                  // Link explicit access
                  if (access) {
                    await supabase
                      .from('customer_product_access')
                      .update({ workspace_id: ws.id })
                      .eq('id', access.id)
                  }

                  // Create workspace membership if missing
                  let userIdCandidate = baseUserId
                  let suffixNum = 1
                  let uniqueUserIdFound = false

                  while (!uniqueUserIdFound && suffixNum < 50) {
                    const { data: existingUser } = await supabase
                      .from('lam_workspace_memberships')
                      .select('id')
                      .eq('workspace_id', ws.id)
                      .ilike('user_id', userIdCandidate)
                      .maybeSingle()

                    if (!existingUser) {
                      uniqueUserIdFound = true
                    } else {
                      suffixNum++
                      userIdCandidate = `${baseUserId}${suffixNum}`
                    }
                  }

                  await supabase
                    .from('lam_workspace_memberships')
                    .upsert(
                      {
                        workspace_id: ws.id,
                        customer_id: mem.customer_id,
                        user_id: userIdCandidate,
                        workspace_role: mem.company_role || 'member',
                        status: mem.status || 'active'
                      },
                      { onConflict: 'workspace_id,customer_id' }
                    )
                }
              }
            }
          }
        }
      }
    }

    // 3. Post-migration integrity verification
    console.log('\n--- POST-MIGRATION INTEGRITY CHECK ---')
    const { count: accCount } = await supabase.from('lam_customer_accounts').select('*', { count: 'exact', head: true })
    const { count: orgCount } = await supabase.from('lam_organizations').select('*', { count: 'exact', head: true })
    const { count: wsCount } = await supabase.from('lam_product_workspaces').select('*', { count: 'exact', head: true })
    const { count: memCount } = await supabase.from('lam_workspace_memberships').select('*', { count: 'exact', head: true })
    const { count: prodCount } = await supabase.from('lam_products').select('*', { count: 'exact', head: true })

    console.log(`lam_customer_accounts count: ${accCount || 0}`)
    console.log(`lam_organizations count: ${orgCount || 0}`)
    console.log(`lam_product_workspaces count: ${wsCount || 0}`)
    console.log(`lam_workspace_memberships count: ${memCount || 0}`)
    console.log(`lam_products count: ${prodCount || 0}`)

    console.log('✅ Stage B Migration and Backfill Completed Successfully!')
  } catch (err: any) {
    console.error('❌ Stage B Migration Error:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runStageBMigration()
