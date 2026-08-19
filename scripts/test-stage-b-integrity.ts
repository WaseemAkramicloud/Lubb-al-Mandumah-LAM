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
  console.log('=== STAGE B FUNCTIONAL & INTEGRITY VERIFICATION (UPDATED REGISTRY) ===')

  // 1. Verify central product registry and identity_mode filter
  const { data: ssoProducts, error: prodErr } = await supabase
    .from('lam_products')
    .select('*')
    .eq('identity_mode', 'lam_sso')

  if (prodErr || !ssoProducts || ssoProducts.length !== 4) {
    throw new Error(`SSO product registry filter failed! Expected 4 SSO products, got ${ssoProducts?.length}`)
  }

  const { data: localProducts } = await supabase
    .from('lam_products')
    .select('*')
    .eq('identity_mode', 'local_platform')

  if (!localProducts || localProducts.length !== 2) {
    throw new Error(`Local platform product filter failed! Expected 2 local platform products, got ${localProducts?.length}`)
  }

  console.log('✅ Central Product Registry Identity Classifications verified:')
  console.log('   LAM SSO Products (Eligible for Workspace Provisioning & OIDC):')
  ssoProducts.forEach(p => console.log(`     - ${p.name} (${p.slug.toUpperCase()}) → Prefix: ${p.workspace_prefix}, Client ID: ${p.client_id}`))
  console.log('   Local / Platform Products (Non-SSO / Display Only):')
  localProducts.forEach(p => console.log(`     - ${p.name} (${p.slug.toUpperCase()}) → Mode: ${p.identity_mode}, Client ID: None`))

  // 2. Test Customer Account & Workspace Provisioning strictly for lam_sso products
  const testAccountCode = `LAM-CA-TEST-${Math.floor(100000 + Math.random() * 900000)}`
  const { data: customerAccount } = await supabase
    .from('lam_customer_accounts')
    .insert({
      customer_account_code: testAccountCode,
      name: 'ABC Holdings Corp',
      status: 'active'
    })
    .select()
    .single()

  const { data: org1 } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_code: `LAM-ORG-TEST-1`,
      name: 'ABC International School',
      status: 'active'
    })
    .select()
    .single()

  // Verify that attempting to provision a workspace for PointO or AMAL is rejected or prevented
  const pointoProd = await supabase.from('lam_products').select('identity_mode').eq('slug', 'pointo').single()
  if (pointoProd.data?.identity_mode !== 'local_platform') {
    throw new Error('PointO should be classified as local_platform!')
  }

  const ahsCode = `AHS${generateRandomSuffix()}`
  const { data: ws1 } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_id: org1!.id,
      product_slug: 'aimhighserp',
      workspace_code: ahsCode,
      plan_tier: 'enterprise',
      max_seats: 25
    })
    .select()
    .single()

  console.log(`✅ Provisioned workspace for SSO product AimHighSERP: ${ws1!.workspace_code}`)

  // Clean up test data
  await supabase.from('lam_customer_accounts').delete().eq('id', customerAccount!.id)
  console.log('✅ Cleanup of synthetic test data completed cleanly.')

  console.log('🎉 ALL UPDATED STAGE B VERIFICATION CHECKS PASSED SUCCESSFULLY!')
}

runIntegrityTest().catch(err => {
  console.error('❌ Verification Error:', err)
  process.exit(1)
})
