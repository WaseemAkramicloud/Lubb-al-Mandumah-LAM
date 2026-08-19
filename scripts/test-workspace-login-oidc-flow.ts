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

import { customerLogin, createWorkspaceEmployeeAccount } from '../lib/actions/customer-auth'
import { getSupabaseAdmin } from '../lib/supabase/admin'

async function testWorkspaceLoginOidcFlow() {
  console.log('===========================================================')
  console.log('TESTING WORKSPACE EMPLOYEE LOGIN & OIDC REDIRECT FLOW')
  console.log('===========================================================')

  const supabase = getSupabaseAdmin()

  const testWorkspaceCode = 'NEXFLOW' + Math.floor(100 + Math.random() * 900)
  const testUserId = 'tariqflow'
  const testPassword = 'Password123!'

  console.log(`\n📌 1. Setting up test workspace [${testWorkspaceCode}] and employee [${testUserId}]...`)

  const { data: customerAccount, error: caErr } = await supabase
    .from('lam_customer_accounts')
    .insert({
      customer_account_code: 'LAM-CA-' + Math.floor(100000 + Math.random() * 900000),
      name: 'OIDC Flow Test Account',
      status: 'active'
    })
    .select('id')
    .single()

  if (caErr || !customerAccount) throw new Error(`Failed to create test customer account: ${caErr?.message}`)

  const { data: organization, error: orgErr } = await supabase
    .from('lam_organizations')
    .insert({
      customer_account_id: customerAccount.id,
      name: 'OIDC Flow Test Org',
      status: 'active'
    })
    .select('id')
    .single()

  if (orgErr || !organization) throw new Error(`Failed to create test organization: ${orgErr?.message}`)

  const { data: workspace, error: wsErr } = await supabase
    .from('lam_product_workspaces')
    .insert({
      customer_account_id: customerAccount.id,
      organization_id: organization.id,
      product_slug: 'nexora',
      workspace_code: testWorkspaceCode,
      plan_tier: 'enterprise',
      max_seats: 5,
      status: 'active'
    })
    .select('id, workspace_code, product_slug')
    .single()

  if (wsErr || !workspace) throw new Error(`Failed to create test workspace: ${wsErr?.message}`)

  // Create workspace employee account using server action helper
  const empResult = await createWorkspaceEmployeeAccount({
    workspaceId: workspace.id,
    userId: testUserId,
    password: testPassword,
    firstName: 'Tariq',
    lastName: 'Employee',
    role: 'member'
  })

  if (!empResult.success) throw new Error(`Failed to create workspace employee account: ${empResult.error}`)

  console.log('✅ Workspace employee setup completed cleanly.')

  // 2. Test Invalid Password Submission
  console.log('\n📌 2. Testing Invalid Password Error Reporting...')
  const invalidForm = new FormData()
  invalidForm.append('login_mode', 'employee')
  invalidForm.append('workspace_code', testWorkspaceCode)
  invalidForm.append('user_id', testUserId)
  invalidForm.append('password', 'WRONG_PASSWORD')
  invalidForm.append('return_to', '/api/sso/authorize?client_id=lam_app_nexora&redirect_uri=https://nexora.lubbalmandumah.com/api/auth/callback')
  invalidForm.append('requesting_product', 'nexora')

  const invalidRes = await customerLogin(invalidForm)
  console.log('   Result:', invalidRes)
  if (!invalidRes.success && invalidRes.error?.includes('Invalid User ID or password')) {
    console.log('✅ Invalid password cleanly returned clear error message!')
  } else {
    throw new Error(`Failed to reject invalid password correctly: ${JSON.stringify(invalidRes)}`)
  }

  // 3. Test Valid Workspace Login Submission with OIDC Return URL
  console.log('\n📌 3. Testing Valid Workspace Login with OIDC return URL...')
  const oidcReturnUrl = '/api/sso/authorize?client_id=lam_app_nexora&redirect_uri=https%3A%2F%2Fnexora.lubbalmandumah.com%2Fapi%2Fauth%2Fcallback&response_type=code&scope=openid+profile+email&state=teststate123&code_challenge=testchallenge&code_challenge_method=S256&nonce=testnonce'

  const validForm = new FormData()
  validForm.append('login_mode', 'employee')
  validForm.append('workspace_code', testWorkspaceCode)
  validForm.append('user_id', testUserId)
  validForm.append('password', testPassword)
  validForm.append('return_to', oidcReturnUrl)
  validForm.append('requesting_product', 'nexora')

  const validRes = await customerLogin(validForm)
  console.log('   Valid Login Result:', validRes)

  if (validRes.success && validRes.redirectUrl === oidcReturnUrl) {
    console.log('✅ Workspace login succeeded and preserved OIDC return URL strictly!')
  } else {
    throw new Error(`Workspace login failed or lost OIDC return URL: ${JSON.stringify(validRes)}`)
  }

  // 4. Teardown test data
  console.log('\n📌 4. Cleaning up test data...')
  if (empResult.authUserId) await supabase.auth.admin.deleteUser(empResult.authUserId)
  if (empResult.customerId) await supabase.from('customer_identities').delete().eq('id', empResult.customerId)
  await supabase.from('lam_workspace_memberships').delete().eq('workspace_id', workspace.id)
  await supabase.from('lam_product_workspaces').delete().eq('id', workspace.id)
  await supabase.from('lam_customer_accounts').delete().eq('id', customerAccount.id)
  console.log('✅ Teardown complete.')

  console.log('\n🎉 ALL WORKSPACE LOGIN & OIDC FLOW TESTS PASSED!')
}

testWorkspaceLoginOidcFlow().catch(err => {
  console.error('❌ TEST FAILED:', err)
  process.exit(1)
})
