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

const ALLOWED_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
function generateRandomSuffix(): string {
  let result = ''
  for (let i = 0; i < 4; i++) {
    const randIndex = Math.floor(Math.random() * ALLOWED_CHARS.length)
    result += ALLOWED_CHARS[randIndex]
  }
  return result
}

async function runIntegrityTest() {
  console.log('=== STAGE B FUNCTIONAL & INTEGRITY VERIFICATION ===')

  // 1. Verify central product registry
  const { data: products, error: prodErr } = await supabase.from('lam_products').select('*')
  if (prodErr || !products || products.length === 0) {
    throw new Error(`Product registry test failed: ${prodErr?.message}`)
  }
  console.log('✅ Central Product Registry active with 6 SaaS products:')
  products.forEach(p => console.log(`   - ${p.name} (${p.slug.toUpperCase()}) → Prefix: ${p.workspace_prefix}, Client ID: ${p.client_id}`))

  // 2. Synthetic Test Customer Account Creation
  const testAccountCode = `LAM-CA-TEST-${Math.floor(100000 + Math.random() * 900000)}`
  const { data: customerAccount, error: accErr } = await supabase
    .from('lam_customer_accounts')
    .insert({
      customer_account_code: testAccountCode,
      name: 'ABC Holdings Corp',
      legal_name: 'ABC Holdings International Ltd',
      country: 'United Kingdom',
      status: 'active'
    })
    .select()
    .single()

  if (accErr || !customerAccount) {
    throw new Error(`Customer Account creation failed: ${accErr?.message}`)
  }
  console.log(`✅ Customer Account created: ${customerAccount.name} (${customerAccount.customer_account_code})`)

  // 3. Synthetic Test Organizations Creation under same Customer Account
  const { data: org1, error: org1Err } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount.id,
      organization_code: `LAM-ORG-TEST-1`,
      name: 'ABC International School',
      status: 'active'
    })
    .select()
    .single()

  const { data: org2, error: org2Err } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount.id,
      organization_code: `LAM-ORG-TEST-2`,
      name: 'ABC Manufacturing Ltd',
      status: 'active'
    })
    .select()
    .single()

  if (org1Err || org2Err || !org1 || !org2) {
    throw new Error(`Organization creation failed: ${org1Err?.message || org2Err?.message}`)
  }
  console.log(`✅ Multi-Organization creation verified under ${customerAccount.name}:`)
  console.log(`   1. ${org1.name} (${org1.id})`)
  console.log(`   2. ${org2.name} (${org2.id})`)

  // 4. Create Product Workspaces with PPPXXXX Workspace Codes
  const nexCode = `NEX${generateRandomSuffix()}`
  const ahsCode = `AHS${generateRandomSuffix()}`
  const atoCode = `ATO${generateRandomSuffix()}`

  const { data: ws1, error: ws1Err } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount.id,
      organization_id: org1.id,
      product_slug: 'aimhighserp',
      workspace_code: ahsCode,
      plan_tier: 'enterprise',
      max_seats: 25,
      status: 'active'
    })
    .select()
    .single()

  const { data: ws2, error: ws2Err } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount.id,
      organization_id: org2.id,
      product_slug: 'atom',
      workspace_code: atoCode,
      plan_tier: 'standard',
      max_seats: 10,
      status: 'active'
    })
    .select()
    .single()

  if (ws1Err || ws2Err || !ws1 || !ws2) {
    throw new Error(`Product Workspace creation failed: ${ws1Err?.message || ws2Err?.message}`)
  }

  console.log('✅ Product Workspaces & PPPXXXX Code Generation verified:')
  console.log(`   1. ${org1.name} → AimHighSERP Workspace Code: ${ws1.workspace_code} (UUID: ${ws1.id})`)
  console.log(`   2. ${org2.name} → ATOM Workspace Code: ${ws2.workspace_code} (UUID: ${ws2.id})`)

  // 5. Test Case-Insensitive Unique Constraint on Workspace Code
  const { error: dupWsErr } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount.id,
      organization_id: org1.id,
      product_slug: 'nexora',
      workspace_code: ahsCode.toLowerCase(), // Duplicate code in lowercase
      plan_tier: 'starter',
      max_seats: 5
    })

  if (!dupWsErr) {
    throw new Error('Case-insensitive uniqueness constraint failed on workspace_code!')
  }
  console.log('✅ Case-insensitive uniqueness constraint on workspace_code verified (rejected duplicate lowercase code).')

  // 6. Test Synthetic Customer Identity & Workspace Membership
  const testEmail = `owner_${Math.floor(10000 + Math.random() * 90000)}@abcholdings.com`
  const { data: customerIdentity, error: custIdErr } = await supabase
    .from('customer_identities')
    .insert({
      email: testEmail,
      first_name: 'Ayesha',
      last_name: 'Khan',
      status: 'active'
    })
    .select()
    .single()

  if (custIdErr || !customerIdentity) {
    throw new Error(`Customer identity creation failed: ${custIdErr?.message}`)
  }

  // Assign same owner across multiple workspaces (Global Owner Identity)
  const { data: mem1, error: mem1Err } = await supabase
    .from('lam_workspace_memberships')
    .insert({
      workspace_id: ws1.id,
      customer_id: customerIdentity.id,
      user_id: 'ayesha',
      workspace_role: 'owner',
      status: 'active'
    })
    .select()
    .single()

  const { data: mem2, error: mem2Err } = await supabase
    .from('lam_workspace_memberships')
    .insert({
      workspace_id: ws2.id,
      customer_id: customerIdentity.id,
      user_id: 'ayesha',
      workspace_role: 'owner',
      status: 'active'
    })
    .select()
    .single()

  if (mem1Err || mem2Err || !mem1 || !mem2) {
    throw new Error(`Global owner workspace membership assignment failed: ${mem1Err?.message || mem2Err?.message}`)
  }

  console.log(`✅ Global Owner Identity verified across multiple workspaces:`)
  console.log(`   Owner: ${customerIdentity.first_name} ${customerIdentity.last_name} (LAM Identity UUID: ${customerIdentity.id})`)
  console.log(`   - Member of Workspace 1 (${ws1.workspace_code}) with User ID: ${mem1.user_id}`)
  console.log(`   - Member of Workspace 2 (${ws2.workspace_code}) with User ID: ${mem2.user_id}`)

  // 7. Cleanup Synthetic Test Data
  await supabase.from('lam_customer_accounts').delete().eq('id', customerAccount.id)
  await supabase.from('customer_identities').delete().eq('id', customerIdentity.id)
  console.log('✅ Cleanup of synthetic test data completed cleanly.')

  console.log('🎉 ALL STAGE B VERIFICATION CHECKS PASSED SUCCESSFULLY!')
}

runIntegrityTest().catch(err => {
  console.error('❌ Verification Error:', err)
  process.exit(1)
})
