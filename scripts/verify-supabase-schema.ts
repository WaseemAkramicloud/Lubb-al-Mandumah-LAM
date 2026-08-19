import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykrjmctfmywhymgpkqlu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })

const EXPECTED_TABLES = [
  'demo_requests',
  'contact_requests',
  'staff_profiles',
  'staff_permissions',
  'staff_audit_logs',
  'staff_settings',
  'cms_products',
  'cms_solutions',
  'cms_industries',
  'cms_insights',
  'cms_careers',
  'cms_sections',
  'cms_media_library',
  'crm_companies',
  'crm_contacts',
  'crm_deals',
  'crm_lead_activity_logs',
  'customer_identities',
  'customer_company_memberships',
  'customer_product_entitlements',
  'customer_product_instances',
  'customer_product_access',
  'customer_audit_logs',
  'customer_sessions',
  'customer_invitations',
  'sso_applications',
  'sso_auth_codes',
  'sso_token_revocations',
  'lam_products',
  'lam_customer_accounts',
  'lam_organizations',
  'lam_product_workspaces',
  'lam_workspace_memberships'
]

async function verifySupabaseSchema() {
  console.log('=== SUPABASE SCHEMA & MIGRATION COMPREHENSIVE AUDIT ===')
  console.log(`Target Supabase URL: ${supabaseUrl}\n`)

  const missingTables: string[] = []
  const verifiedTables: string[] = []

  for (const tableName of EXPECTED_TABLES) {
    const { data, error } = await supabase.from(tableName).select('id').limit(1)
    if (error && error.code === '42P01') {
      // 42P01 is PostgreSQL relation does not exist
      missingTables.push(tableName)
    } else {
      verifiedTables.push(tableName)
    }
  }

  console.log(`✅ Verified ${verifiedTables.length} / ${EXPECTED_TABLES.length} Database Tables exist:`)
  verifiedTables.forEach(t => console.log(`   - ${t}`))

  if (missingTables.length > 0) {
    console.error(`\n❌ MISSING TABLES DETECTED (${missingTables.length}):`)
    missingTables.forEach(t => console.error(`   - ${t}`))
  } else {
    console.log('\n🎉 ALL 33 DATABASE TABLES ARE OPERATIONAL ON SUPABASE!')
  }

  // Check specific crucial columns from recent migrations
  console.log('\n--- Checking Column Additions from Recent Migrations ---')

  // Migration 20260819000002_lam_products_identity_mode.sql
  const { data: prodData, error: prodErr } = await supabase.from('lam_products').select('slug, identity_mode').limit(1)
  if (prodErr) {
    console.error('❌ Column check failed for lam_products.identity_mode:', prodErr.message)
  } else {
    console.log('✅ lam_products.identity_mode column is active.')
  }

  // Migration 20260819000003_sso_auth_codes_workspace_context.sql
  const { data: authCodeData, error: authCodeErr } = await supabase.from('sso_auth_codes').select('workspace_id, workspace_code').limit(1)
  if (authCodeErr) {
    console.error('❌ Column check failed for sso_auth_codes workspace context:', authCodeErr.message)
  } else {
    console.log('✅ sso_auth_codes.workspace_id and workspace_code columns are active.')
  }

  // Migration 20260815000003_sso_auth_codes_nonce_column.sql
  const { data: nonceData, error: nonceErr } = await supabase.from('sso_auth_codes').select('nonce').limit(1)
  if (nonceErr) {
    console.error('❌ Column check failed for sso_auth_codes.nonce:', nonceErr.message)
  } else {
    console.log('✅ sso_auth_codes.nonce column is active.')
  }

  // Migration 20260819000001_lam_central_identity_control_plane.sql
  const { data: wsData, error: wsErr } = await supabase.from('lam_product_workspaces').select('workspace_code, max_seats, plan_tier').limit(1)
  if (wsErr) {
    console.error('❌ Column check failed for lam_product_workspaces:', wsErr.message)
  } else {
    console.log('✅ lam_product_workspaces columns (workspace_code, max_seats, plan_tier) are active.')
  }

  console.log('\n=== AUDIT COMPLETE ===')
}

verifySupabaseSchema().catch(err => {
  console.error('Audit script failed:', err)
  process.exit(1)
})
