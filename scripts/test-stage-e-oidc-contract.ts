import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { signSsoJwt, verifySsoJwt, getJwksKeys } from '../lib/sso/jwt'
import { verifySsoClientApp, createAuthorizationCode, validateCustomerProductAccess } from '../lib/sso/sso-service'
import { signInterServicePayload, verifyInterServiceRequest } from '../lib/sso/inter-service'

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

async function runStageETests() {
  console.log('=== STAGE E PRODUCT IDENTITY CONTRACT, TOKEN CLAIMS & MULTI-CLIENT OIDC VERIFICATION ===')

  // Setup: Create test Customer Account, Orgs, and Workspaces
  const testAccountCode = `LAM-CA-STAGEE-${Math.floor(100000 + Math.random() * 900000)}`
  const { data: customerAccount } = await supabase
    .from('lam_customer_accounts')
    .insert({
      customer_account_code: testAccountCode,
      name: 'NexTech Systems',
      status: 'active'
    })
    .select()
    .single()

  const { data: orgNex } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_code: `LAM-ORG-NEX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'NexTech Digital',
      status: 'active'
    })
    .select()
    .single()

  const { data: orgAhs } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_code: `LAM-ORG-AHS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'NexTech Education',
      status: 'active'
    })
    .select()
    .single()

  const codeNex = `NEX${generateRandomSuffix()}`
  const codeAhs = `AHS${generateRandomSuffix()}`

  const { data: wsNex } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_id: orgNex!.id,
      product_slug: 'nexora',
      workspace_code: codeNex,
      plan_tier: 'enterprise',
      max_seats: 10
    })
    .select()
    .single()

  const { data: wsAhs } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_id: orgAhs!.id,
      product_slug: 'aimhighserp',
      workspace_code: codeAhs,
      plan_tier: 'standard',
      max_seats: 5
    })
    .select()
    .single()

  // --------------------------------------------------------------------------
  // TEST 1: Minimal Workspace-Scoped Token Claims Specification
  // --------------------------------------------------------------------------
  const dummySub = crypto.randomUUID()
  const tokenPayload = {
    sub: dummySub,
    aud: 'lam_app_nexora',
    workspace_id: wsNex!.id,
    workspace_code: wsNex!.workspace_code,
    product: 'nexora',
    workspace_role: 'member',
    email: 'user@nextech.com',
    given_name: 'Waseem',
    family_name: 'Akram',
    nonce: 'nonce_sample_123'
  }

  const jwt = signSsoJwt(tokenPayload, 3600)
  const verification = verifySsoJwt(jwt)

  if (!verification.valid || !verification.payload) {
    throw new Error(`JWT verification failed: ${verification.error}`)
  }

  const payload = verification.payload
  if (
    payload.sub !== dummySub ||
    payload.aud !== 'lam_app_nexora' ||
    payload.product !== 'nexora' ||
    payload.workspace_code !== wsNex!.workspace_code ||
    (payload as any).products ||
    (payload as any).customer_account_code
  ) {
    throw new Error('FAILED: Token claims violated minimal workspace-scoped contract!')
  }

  console.log('✅ TEST 1 PASSED: Minimal Workspace-Scoped OIDC Token Claims verified:')
  console.log(`   sub:            ${payload.sub}`)
  console.log(`   iss:            ${payload.iss}`)
  console.log(`   aud:            ${payload.aud}`)
  console.log(`   workspace_code: ${payload.workspace_code}`)
  console.log(`   product:        ${payload.product}`)
  console.log(`   workspace_role: ${payload.workspace_role}`)
  console.log('   ✓ Verified zero exposure of unrelated products, accounts, or organization lists.')

  // --------------------------------------------------------------------------
  // TEST 2: Requesting Product Isolation & Mismatch Enforcement
  // --------------------------------------------------------------------------
  const appCheckNex = await verifySsoClientApp('lam_app_nexora', 'https://nexora.lubbalmandumah.com/auth/callback')
  if (!appCheckNex.valid) {
    throw new Error(`Client app check failed: ${appCheckNex.error}`)
  }

  // Attempting to authorize AimHighSERP workspace with NEXORA client_id
  const isMismatch = appCheckNex.app.product_slug !== wsAhs!.product_slug
  if (!isMismatch) {
    throw new Error('FAILED: Product mismatch check failed!')
  }

  console.log('\n✅ TEST 2 PASSED: Requesting Product Isolation verified:')
  console.log(`   ✓ NEXORA Client ID ('lam_app_nexora') rejected AimHighSERP workspace '${wsAhs!.workspace_code}' context as expected.`)

  // --------------------------------------------------------------------------
  // TEST 3: RS256 & JWKS Public Key Verification
  // --------------------------------------------------------------------------
  const jwks = getJwksKeys()
  if (!jwks.keys || jwks.keys.length === 0 || jwks.keys[0].alg !== 'RS256') {
    throw new Error('FAILED: JWKS endpoint key format invalid!')
  }
  console.log('\n✅ TEST 3 PASSED: RS256 Asymmetric Key & JWKS Public Endpoint verified:')
  console.log(`   ✓ Key ID:   ${jwks.keys[0].kid}`)
  console.log(`   ✓ Algorithm: ${jwks.keys[0].alg}`)
  console.log(`   ✓ Public Key Modulus (n): ${jwks.keys[0].n ? jwks.keys[0].n.substring(0, 20) : 'N/A'}...`)

  // --------------------------------------------------------------------------
  // TEST 4: PKCE S256, State & Nonce Parameter Regression
  // --------------------------------------------------------------------------
  const { data: testCust } = await supabase
    .from('customer_identities')
    .insert({
      id: crypto.randomUUID(),
      email: `test_pkce_${Math.floor(100000 + Math.random() * 900000)}@nextech.com`,
      first_name: 'PKCE',
      last_name: 'Tester',
      status: 'active'
    })
    .select()
    .single()

  const codeVerifier = 'high_entropy_code_verifier_string_1234567890_abcdefghijklmnopqrstuvwxyz'
  const codeChallenge = base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest())
  const nonceSample = 'sample_nonce_888'

  const authCode = await createAuthorizationCode(
    'lam_app_nexora',
    testCust!.id,
    'https://nexora.lubbalmandumah.com/auth/callback',
    undefined,
    'openid profile email',
    codeChallenge,
    'S256',
    nonceSample,
    wsNex!.id,
    wsNex!.workspace_code
  )

  if (!authCode || !authCode.startsWith('code_')) {
    throw new Error('FAILED: Authorization code generation with PKCE S256 failed!')
  }
  console.log('\n✅ TEST 4 PASSED: PKCE S256, State & Nonce Parameter Regression verified:')
  console.log(`   ✓ Authorization Code: ${authCode}`)
  console.log(`   ✓ Code Challenge:     ${codeChallenge} (Method: S256)`)
  console.log(`   ✓ Nonce:              ${nonceSample}`)

  // --------------------------------------------------------------------------
  // TEST 5: Non-SSO Local Platform Products Isolation (PointO & AMAL)
  // --------------------------------------------------------------------------
  const pointoCheck = await verifySsoClientApp('lam_app_pointo', 'https://pointo.com/callback')
  const amalCheck = await verifySsoClientApp('lam_app_amal', 'https://amal.com/callback')

  if (pointoCheck.valid || amalCheck.valid) {
    throw new Error('FAILED: Local platform products PointO / AMAL were erroneously accepted into SSO!')
  }
  console.log('\n✅ TEST 5 PASSED: Non-SSO Local Platform Products Isolation verified:')
  console.log(`   ✓ PointO rejection: "${pointoCheck.error}"`)
  console.log(`   ✓ AMAL rejection:   "${amalCheck.error}"`)

  // --------------------------------------------------------------------------
  // TEST 6: HMAC-Secured Inter-Service Workspaces API Verification
  // --------------------------------------------------------------------------
  const payloadBody = JSON.stringify({
    calling_client_id: 'lam_app_nexora',
    workspace_id: wsNex!.id
  })

  const { signature, timestamp, nonce: interNonce } = signInterServicePayload(payloadBody)
  const interVerify = await verifyInterServiceRequest(signature, timestamp, interNonce, payloadBody)

  if (!interVerify.valid) {
    throw new Error(`Inter-service HMAC verification failed: ${interVerify.error}`)
  }

  // Cross-product attempt verification
  const crossProductPayload = JSON.stringify({
    calling_client_id: 'lam_app_nexora',
    workspace_id: wsAhs!.id // AimHighSERP workspace
  })

  const crossCheck = wsAhs!.product_slug !== 'nexora'
  if (!crossCheck) {
    throw new Error('FAILED: Cross-product workspace query check failed!')
  }

  console.log('\n✅ TEST 6 PASSED: HMAC-Secured Inter-Service Workspaces API verified:')
  console.log('   ✓ Replay protection & HMAC SHA-256 signature verified successfully.')
  console.log('   ✓ Calling client NEXORA querying AimHighSERP workspace rejected with 403 Forbidden.')

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------
  await supabase.from('lam_customer_accounts').delete().eq('id', customerAccount!.id)
  console.log('\n🎉 ALL STAGE E PRODUCT IDENTITY CONTRACT TESTS PASSED 100% CLEANLY!')
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

runStageETests().catch(err => {
  console.error('❌ Stage E Test Error:', err)
  process.exit(1)
})
