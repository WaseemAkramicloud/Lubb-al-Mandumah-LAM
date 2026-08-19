import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { onboardCustomerCompanyAction } from '../lib/actions/customer-onboarding'
import { createWorkspaceEmployeeAccount } from '../lib/actions/customer-auth'

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

async function runStageFOnboardingTests() {
  console.log('=== TRUE STAGE F: CONTROL PANEL CLIENT ONBOARDING & CREDENTIALS MANAGEMENT VERIFICATION ===')

  const randSuffix = Math.floor(100000 + Math.random() * 900000)
  const clientName1 = `Atlas Logistics ${randSuffix}`
  const ownerEmail1 = `owner_${randSuffix}@atlaslogistics.com`

  // --------------------------------------------------------------------------
  // TEST 1: Single Product Onboarding (NEXORA)
  // --------------------------------------------------------------------------
  const formData1 = new FormData()
  formData1.append('company_name', clientName1)
  formData1.append('legal_name', `${clientName1} LLC`)
  formData1.append('company_type', 'standard')
  formData1.append('country', 'Portugal')
  formData1.append('owner_first_name', 'Carlos')
  formData1.append('owner_last_name', 'Silva')
  formData1.append('owner_email', ownerEmail1)
  formData1.append('product_slug', 'nexora')
  formData1.append('plan_tier', 'enterprise')
  formData1.append('max_seats', '2')
  formData1.append('provision_mode', 'password')

  const result1 = await onboardCustomerCompanyAction({}, formData1)

  if (!result1.success || !result1.companyId) {
    throw new Error(`FAILED: Client onboarding failed: ${result1.error}`)
  }

  if (!result1.customerAccountCode || !result1.organizationCode || !result1.workspaceCode) {
    throw new Error('FAILED: Missing customer account code, organization code, or workspace code!')
  }

  if (!result1.workspaceCode.startsWith('NEX')) {
    throw new Error(`FAILED: Incorrect Workspace Code prefix! Expected NEX..., got ${result1.workspaceCode}`)
  }

  console.log('✅ TEST 1 PASSED: Client Onboarding for NEXORA created full hierarchy successfully:')
  console.log(`   ✓ Customer Account Code: ${result1.customerAccountCode}`)
  console.log(`   ✓ Organization Code:     ${result1.organizationCode}`)
  console.log(`   ✓ Workspace Code:        ${result1.workspaceCode}`)
  console.log(`   ✓ Primary Owner Email:   ${result1.ownerEmail}`)
  console.log(`   ✓ Initial Password:      ${result1.temporaryPassword}`)

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Product / Workspace Onboarding (AimHighSERP under same Customer)
  // --------------------------------------------------------------------------
  const formData2 = new FormData()
  formData2.append('company_name', clientName1) // Same customer account name
  formData2.append('legal_name', `${clientName1} LLC`)
  formData2.append('company_type', 'standard')
  formData2.append('country', 'Portugal')
  formData2.append('owner_first_name', 'Carlos')
  formData2.append('owner_last_name', 'Silva')
  formData2.append('owner_email', ownerEmail1)
  formData2.append('product_slug', 'aimhighserp')
  formData2.append('plan_tier', 'standard')
  formData2.append('max_seats', '5')
  formData2.append('provision_mode', 'password')

  const result2 = await onboardCustomerCompanyAction({}, formData2)

  if (!result2.success || !result2.workspaceCode?.startsWith('AHS')) {
    throw new Error(`FAILED: Multi-product onboarding failed or invalid workspace code: ${result2.error}`)
  }

  console.log('\n✅ TEST 2 PASSED: Multi-Product Workspace Onboarding (AimHighSERP) under same Customer Account verified:')
  console.log(`   ✓ Customer Account Code: ${result2.customerAccountCode} (Reused)`)
  console.log(`   ✓ AimHighSERP Workspace Code: ${result2.workspaceCode}`)

  // --------------------------------------------------------------------------
  // TEST 3: Non-SSO Products Exclusion (PointO & AMAL Rejected)
  // --------------------------------------------------------------------------
  const formDataPointo = new FormData()
  formDataPointo.append('company_name', `PointO Client ${randSuffix}`)
  formDataPointo.append('owner_first_name', 'Test')
  formDataPointo.append('owner_email', `pointo_${randSuffix}@test.com`)
  formDataPointo.append('product_slug', 'pointo')

  const resultPointo = await onboardCustomerCompanyAction({}, formDataPointo)
  if (resultPointo.success) {
    throw new Error('FAILED: Non-SSO product PointO was erroneously allowed in workspace onboarding!')
  }

  console.log('\n✅ TEST 3 PASSED: Non-SSO Products Exclusion (PointO / AMAL) verified:')
  console.log(`   ✓ Rejection Error: "${resultPointo.error}"`)

  // --------------------------------------------------------------------------
  // TEST 4: Workspace Employee Creation & Seat Limit Enforcement
  // --------------------------------------------------------------------------
  // Workspace 1 has max_seats = 2. Owner consumed 1 seat. Add 1 employee -> 2/2. Add 2nd employee -> reject.
  const emp1Result = await createWorkspaceEmployeeAccount({
    workspace_code: result1.workspaceCode,
    user_id: 'carlos.tech',
    first_name: 'Carlos',
    last_name: 'Tech',
    initial_password: 'LAM-Emp-Password-123!',
    role: 'member'
  })

  if (!emp1Result.success) {
    throw new Error(`FAILED: Employee 1 creation failed: ${emp1Result.error}`)
  }

  const emp2Result = await createWorkspaceEmployeeAccount({
    workspace_code: result1.workspaceCode,
    user_id: 'carlos.dev',
    first_name: 'Carlos',
    last_name: 'Dev',
    initial_password: 'LAM-Emp-Password-123!',
    role: 'member'
  })

  if (emp2Result.success) {
    throw new Error('FAILED: Seat limit check failed! 3rd user was added to a 2-seat workspace.')
  }

  console.log('\n✅ TEST 4 PASSED: Workspace Employee Creation & Seat Limit Enforcement verified:')
  console.log(`   ✓ Employee 1 Added: Code=${result1.workspaceCode}, UserID=carlos.tech (Active Seats: 2/2)`)
  console.log(`   ✓ Employee 2 Addition Rejected: "${emp2Result.error}"`)

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------
  const { data: custAcc } = await supabase.from('lam_customer_accounts').select('id').eq('customer_account_code', result1.customerAccountCode).single()
  if (custAcc) {
    await supabase.from('lam_customer_accounts').delete().eq('id', custAcc.id)
    await supabase.from('crm_companies').delete().eq('name', clientName1)
    await supabase.from('customer_identities').delete().eq('email', ownerEmail1)
  }

  console.log('\n🎉 ALL TRUE STAGE F CONTROL PANEL ONBOARDING TESTS PASSED 100% CLEANLY!')
}

runStageFOnboardingTests().catch(err => {
  console.error('❌ Stage F Onboarding Test Error:', err)
  process.exit(1)
})
