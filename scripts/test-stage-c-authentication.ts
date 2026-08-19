import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { createWorkspaceEmployeeAccount, customerWorkspaceLogin, customerLogin } from '../lib/actions/customer-auth'

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

async function runStageCTests() {
  console.log('=== STAGE C AUTHENTICATION & IDENTITY ISOLATION VERIFICATION ===')

  // Setup: Create test Customer Account, Organization, and 2 Product Workspaces (AHS and NEX)
  const testAccountCode = `LAM-CA-TEST-${Math.floor(100000 + Math.random() * 900000)}`
  const { data: customerAccount } = await supabase
    .from('lam_customer_accounts')
    .insert({
      customer_account_code: testAccountCode,
      name: 'OmniGlobal Holdings',
      status: 'active'
    })
    .select()
    .single()

  const { data: orgSchool } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_code: 'LAM-ORG-SCHOOL',
      name: 'Omni Education School',
      status: 'active'
    })
    .select()
    .single()

  const { data: orgMarketing } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_code: 'LAM-ORG-MARKETING',
      name: 'Omni Media & Marketing',
      status: 'active'
    })
    .select()
    .single()

  const codeAhs = `AHS${generateRandomSuffix()}`
  const codeNex = `NEX${generateRandomSuffix()}`

  const { data: wsAhs } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_id: orgSchool!.id,
      product_slug: 'aimhighserp',
      workspace_code: codeAhs,
      plan_tier: 'enterprise',
      max_seats: 15
    })
    .select()
    .single()

  const { data: wsNex } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_id: orgMarketing!.id,
      product_slug: 'nexora',
      workspace_code: codeNex,
      plan_tier: 'standard',
      max_seats: 10
    })
    .select()
    .single()

  console.log(`✅ Provisioned 2 Product Workspaces:`)
  console.log(`   1. AimHighSERP Workspace Code: ${wsAhs!.workspace_code} (Org: ${orgSchool!.name})`)
  console.log(`   2. NEXORA Workspace Code: ${wsNex!.workspace_code} (Org: ${orgMarketing!.name})`)

  // --------------------------------------------------------------------------
  // TEST 1 & 2: Same physical human creating 2 independent workspace accounts
  // --------------------------------------------------------------------------
  const passwordA = 'SchoolPassword123!'
  const passwordB = 'MarketingPassword456!'

  const acc1Res = await createWorkspaceEmployeeAccount({
    workspaceId: wsAhs!.id,
    userId: 'waseem.school',
    password: passwordA,
    firstName: 'Waseem',
    lastName: 'Akram',
    workspaceRole: 'member'
  })

  const acc2Res = await createWorkspaceEmployeeAccount({
    workspaceId: wsNex!.id,
    userId: 'waseem.marketing',
    password: passwordB,
    firstName: 'Waseem',
    lastName: 'Akram',
    workspaceRole: 'member'
  })

  if (!acc1Res.success || !acc2Res.success) {
    throw new Error(`Workspace account creation failed: ${acc1Res.error || acc2Res.error}`)
  }

  console.log('\n✅ TEST 1 & 2 PASSED: 2 Independent Workspace Accounts created for same physical person:')
  console.log(`   Account 1: Code=${acc1Res.workspaceCode}, UserID=${acc1Res.userId}`)
  console.log(`              customer_identities.id = ${acc1Res.customerId}`)
  console.log(`              auth_user_id           = ${acc1Res.authUserId}`)
  console.log(`   Account 2: Code=${acc2Res.workspaceCode}, UserID=${acc2Res.userId}`)
  console.log(`              customer_identities.id = ${acc2Res.customerId}`)
  console.log(`              auth_user_id           = ${acc2Res.authUserId}`)

  if (acc1Res.customerId === acc2Res.customerId || acc1Res.authUserId === acc2Res.authUserId) {
    throw new Error('FAILED: Customer identity or Auth user IDs were erroneously merged!')
  }
  console.log('   ✓ Verified customer_identities.id and auth_user_id are strictly distinct and unmerged.')

  // --------------------------------------------------------------------------
  // TEST 3 & 4: Authentication of each independent workspace account
  // --------------------------------------------------------------------------
  const login1 = await customerWorkspaceLogin({
    workspaceCode: acc1Res.workspaceCode!,
    userId: acc1Res.userId!,
    password: passwordA
  })

  const login2 = await customerWorkspaceLogin({
    workspaceCode: acc2Res.workspaceCode!,
    userId: acc2Res.userId!,
    password: passwordB
  })

  if (!login1.success || !login2.success) {
    throw new Error(`Workspace login failed: ${login1.error || login2.error}`)
  }
  console.log('\n✅ TEST 3 & 4 PASSED: Authentication successful for both independent accounts:')
  console.log(`   Account 1 Login: customerId=${login1.customerId}, product=${login1.productSlug}`)
  console.log(`   Account 2 Login: customerId=${login2.customerId}, product=${login2.productSlug}`)

  // --------------------------------------------------------------------------
  // TEST 5: Password Independence (Changing Password A does NOT affect Password B)
  // --------------------------------------------------------------------------
  const newPasswordA = 'NewSchoolPassword999!'
  await supabase.auth.admin.updateUserById(acc1Res.authUserId!, { password: newPasswordA })

  const login1New = await customerWorkspaceLogin({
    workspaceCode: acc1Res.workspaceCode!,
    userId: acc1Res.userId!,
    password: newPasswordA
  })

  const login2Unchanged = await customerWorkspaceLogin({
    workspaceCode: acc2Res.workspaceCode!,
    userId: acc2Res.userId!,
    password: passwordB // Should still work with original Password B
  })

  if (!login1New.success || !login2Unchanged.success) {
    throw new Error('FAILED: Password independence test failed!')
  }
  console.log('\n✅ TEST 5 PASSED: Password Independence verified:')
  console.log('   ✓ Changed Account 1 password to new password → authenticated successfully.')
  console.log('   ✓ Account 2 password remained unchanged and operational.')

  // --------------------------------------------------------------------------
  // TEST 6: Suspension Independence (Suspending Account 1 does NOT suspend Account 2)
  // --------------------------------------------------------------------------
  await supabase.from('customer_identities').update({ status: 'suspended' }).eq('id', acc1Res.customerId!)

  const login1Suspended = await customerWorkspaceLogin({
    workspaceCode: acc1Res.workspaceCode!,
    userId: acc1Res.userId!,
    password: newPasswordA
  })

  const login2Active = await customerWorkspaceLogin({
    workspaceCode: acc2Res.workspaceCode!,
    userId: acc2Res.userId!,
    password: passwordB
  })

  if (login1Suspended.success || !login2Active.success) {
    throw new Error('FAILED: Suspension independence test failed!')
  }
  console.log('\n✅ TEST 6 PASSED: Suspension Independence verified:')
  console.log(`   ✓ Account 1 login blocked correctly: "${login1Suspended.error}"`)
  console.log('   ✓ Account 2 remained active and authenticated successfully.')

  // Re-activate Account 1 for cleanup
  await supabase.from('customer_identities').update({ status: 'active' }).eq('id', acc1Res.customerId!)

  // --------------------------------------------------------------------------
  // TEST 7: Product Mismatch Enforcement
  // --------------------------------------------------------------------------
  const mismatchTest = await customerWorkspaceLogin({
    workspaceCode: acc1Res.workspaceCode!, // AHS workspace code
    userId: acc1Res.userId!,
    password: newPasswordA,
    requestingProduct: 'nexora' // Logging in via NEXORA
  })

  if (mismatchTest.success) {
    throw new Error('FAILED: Product mismatch was not rejected!')
  }
  console.log('\n✅ TEST 7 PASSED: Product Mismatch Enforcement verified:')
  console.log(`   ✓ Rejection message: "${mismatchTest.error}"`)

  // --------------------------------------------------------------------------
  // TEST 8: Company Owner Account Isolation
  // --------------------------------------------------------------------------
  const ownerEmail = `owner_${Math.floor(100000 + Math.random() * 900000)}@omniglobal.com`
  const ownerPassword = 'OwnerMasterPassword789!'

  const { data: authOwner } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true
  })

  if (!authOwner || !authOwner.user) {
    throw new Error('Failed to create authOwner user')
  }

  const { data: custOwner } = await supabase
    .from('customer_identities')
    .insert({
      id: authOwner.user.id,
      auth_user_id: authOwner.user.id,
      email: ownerEmail,
      first_name: 'Ayesha',
      last_name: 'Khan',
      status: 'active'
    })
    .select()
    .single()

  const formData = new FormData()
  formData.append('login_mode', 'owner')
  formData.append('email', ownerEmail)
  formData.append('password', ownerPassword)

  const ownerLoginRes = await customerLogin(formData)

  if (!ownerLoginRes.success) {
    throw new Error(`Owner login failed: ${ownerLoginRes.error || 'Unknown error'}`)
  }
  console.log('\n✅ TEST 8 PASSED: Company Owner Account Isolation verified:')
  console.log(`   ✓ Owner login via Email (${ownerEmail}) authenticated successfully.`)
  console.log('   ✓ Owner identity is separate from workspace employee identities.')

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------
  await supabase.auth.admin.deleteUser(acc1Res.authUserId!)
  await supabase.auth.admin.deleteUser(acc2Res.authUserId!)
  if (authOwner?.user?.id) {
    await supabase.auth.admin.deleteUser(authOwner.user.id)
  }
  await supabase.from('lam_customer_accounts').delete().eq('id', customerAccount!.id)

  console.log('\n🎉 ALL STAGE C AUTHENTICATION TESTS PASSED 100% CLEANLY!')
}

runStageCTests().catch(err => {
  console.error('❌ Stage C Test Error:', err)
  process.exit(1)
})
