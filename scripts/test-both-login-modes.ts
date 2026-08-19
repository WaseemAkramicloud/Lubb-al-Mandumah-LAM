import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) process.env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim()
    }
  })
}

import { customerLoginAction, createWorkspaceEmployeeAccount } from '../lib/actions/customer-auth'
import { getSupabaseAdmin } from '../lib/supabase/admin'

async function testBothLoginModes() {
  console.log('===========================================================')
  console.log('TESTING BOTH AUTHENTICATION MODES (OWNER & EMPLOYEE)')
  console.log('===========================================================')

  const supabase = getSupabaseAdmin()

  // --- PART 1: OWNER LOGIN MODE TESTS ---
  console.log('\n--- PART 1: COMPANY OWNER LOGIN MODE ---')

  // Setup test Owner account
  const ownerEmail = `testowner_${Math.floor(100000 + Math.random() * 900000)}@testcompany.com`
  const ownerPassword = 'Password123!'

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true
  })
  if (authErr) throw new Error(`Failed to create test owner auth user: ${authErr.message}`)

  const { data: ownerCustomer } = await supabase
    .from('customer_identities')
    .insert({
      auth_user_id: authUser.user.id,
      email: ownerEmail,
      first_name: 'Test',
      last_name: 'Owner',
      status: 'active'
    })
    .select('id')
    .single()

  console.log(`✅ Created test Company Owner: ${ownerEmail}`)

  // 1A: Invalid Owner Password
  console.log('\n📌 1A: Testing Invalid Owner Password...')
  const invalidOwnerForm = new FormData()
  invalidOwnerForm.append('login_mode', 'owner')
  invalidOwnerForm.append('email', ownerEmail)
  invalidOwnerForm.append('password', 'WRONG_PASSWORD')
  invalidOwnerForm.append('return_to', '/portal')

  const res1A = await customerLoginAction({}, invalidOwnerForm)
  console.log('   Result 1A:', res1A)
  if (!res1A.success && res1A.error === 'Invalid Owner email or password.') {
    console.log('✅ 1A PASSED: Invalid owner password correctly returned safe error message!')
  } else {
    throw new Error(`1A FAILED: Expected invalid owner password error, got: ${JSON.stringify(res1A)}`)
  }

  // 1B: Valid Owner Login (Must redirect to access.lubbalmandumah.com/portal in production or /portal in dev)
  console.log('\n📌 1B: Testing Valid Owner Login Redirect Target...')
  const validOwnerForm = new FormData()
  validOwnerForm.append('login_mode', 'owner')
  validOwnerForm.append('email', ownerEmail)
  validOwnerForm.append('password', ownerPassword)
  validOwnerForm.append('return_to', '/portal')

  try {
    const res1B = await customerLoginAction({}, validOwnerForm)
    console.log('   Result 1B:', res1B)
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      const redirectUrl = err.digest.split(';')[2]
      console.log('   Captured Server-Side Redirect Signal:', redirectUrl)
      if (redirectUrl.includes('/portal')) {
        console.log('✅ 1B PASSED: Valid Owner Login triggered server-side redirect to Owner Console!')
      } else {
        throw new Error(`1B FAILED: Unexpected redirect target: ${redirectUrl}`)
      }
    } else {
      throw err
    }
  }


  // --- PART 2: WORKSPACE EMPLOYEE LOGIN MODE TESTS ---
  console.log('\n--- PART 2: WORKSPACE EMPLOYEE LOGIN MODE ---')

  const testWorkspaceCode = 'NEXTEST' + Math.floor(100 + Math.random() * 900)
  const testUserId = 'employee1'
  const testEmpPassword = 'Password123!'

  const { data: customerAccount } = await supabase
    .from('lam_customer_accounts')
    .insert({
      customer_account_code: 'LAM-CA-' + Math.floor(100000 + Math.random() * 900000),
      name: 'Test Customer Account',
      status: 'active'
    })
    .select('id')
    .single()

  const { data: organization } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount!.id,
      name: 'Test Org',
      status: 'active'
    })
    .select('id')
    .single()

  const { data: workspace } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount!.id,
      organization_id: organization!.id,
      product_slug: 'nexora',
      workspace_code: testWorkspaceCode,
      plan_tier: 'enterprise',
      max_seats: 5,
      status: 'active'
    })
    .select('id')
    .single()

  const empRes = await createWorkspaceEmployeeAccount({
    workspaceId: workspace!.id,
    userId: testUserId,
    password: testEmpPassword,
    firstName: 'Emp',
    lastName: 'Test',
    role: 'member'
  })

  if (!empRes.success) throw new Error(`Failed to set up workspace employee: ${empRes.error}`)

  console.log(`✅ Created test Workspace Employee: Code=${testWorkspaceCode}, UserID=${testUserId}`)

  // 2A: Invalid Employee Password
  console.log('\n📌 2A: Testing Invalid Employee Password...')
  const invalidEmpForm = new FormData()
  invalidEmpForm.append('login_mode', 'employee')
  invalidEmpForm.append('workspace_code', testWorkspaceCode)
  invalidEmpForm.append('user_id', testUserId)
  invalidEmpForm.append('password', 'WRONG_PASSWORD')
  invalidEmpForm.append('return_to', '/api/sso/authorize?client_id=lam_app_nexora&redirect_uri=https://nexora.lubbalmandumah.com/api/auth/callback')
  invalidEmpForm.append('requesting_product', 'nexora')

  const res2A = await customerLoginAction({}, invalidEmpForm)
  console.log('   Result 2A:', res2A)
  if (!res2A.success && res2A.error?.includes('Invalid User ID or password')) {
    console.log('✅ 2A PASSED: Invalid employee password correctly returned safe error message!')
  } else {
    throw new Error(`2A FAILED: Expected invalid employee password error, got: ${JSON.stringify(res2A)}`)
  }

  // 2B: Valid Employee Login with OIDC Return URL
  console.log('\n📌 2B: Testing Valid Employee Login Redirect Target...')
  const oidcReturnUrl = '/api/sso/authorize?client_id=lam_app_nexora&redirect_uri=https%3A%2F%2Fnexora.lubbalmandumah.com%2Fapi%2Fauth%2Fcallback&response_type=code&scope=openid+profile+email&state=state123&code_challenge=challenge123&code_challenge_method=S256&nonce=nonce123'
  
  const validEmpForm = new FormData()
  validEmpForm.append('login_mode', 'employee')
  validEmpForm.append('workspace_code', testWorkspaceCode)
  validEmpForm.append('user_id', testUserId)
  validEmpForm.append('password', testEmpPassword)
  validEmpForm.append('return_to', oidcReturnUrl)
  validEmpForm.append('requesting_product', 'nexora')

  try {
    const res2B = await customerLoginAction({}, validEmpForm)
    console.log('   Result 2B:', res2B)
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      const redirectUrl = err.digest.split(';')[2]
      console.log('   Captured Server-Side Redirect Signal:', redirectUrl)
      if (redirectUrl === oidcReturnUrl) {
        console.log('✅ 2B PASSED: Valid Employee Login triggered server-side redirect to OIDC Authorize endpoint!')
      } else {
        throw new Error(`2B FAILED: Expected redirect to ${oidcReturnUrl}, got ${redirectUrl}`)
      }
    } else {
      throw err
    }
  }


  // --- TEARDOWN ---
  console.log('\n📌 Cleaning up test records...')
  if (authUser?.user?.id) await supabase.auth.admin.deleteUser(authUser.user.id)
  if (ownerCustomer?.id) await supabase.from('customer_identities').delete().eq('id', ownerCustomer.id)
  if (empRes.authUserId) await supabase.auth.admin.deleteUser(empRes.authUserId)
  if (empRes.customerId) await supabase.from('customer_identities').delete().eq('id', empRes.customerId)
  if (workspace?.id) {
    await supabase.from('lam_workspace_memberships').delete().eq('workspace_id', workspace.id)
    await supabase.from('lam_product_workspaces').delete().eq('id', workspace.id)
  }
  if (organization?.id) await supabase.from('lam_organizations').delete().eq('id', organization.id)
  if (customerAccount?.id) await supabase.from('lam_customer_accounts').delete().eq('id', customerAccount.id)
  console.log('✅ Cleanup complete.')

  console.log('\n🎉 ALL OWNER & EMPLOYEE LOGIN MODE TESTS PASSED 100% CLEANLY!')
}

testBothLoginModes().catch(err => {
  console.error('❌ TEST FAILED:', err)
  process.exit(1)
})
