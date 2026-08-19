'use server'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logCustomerAudit } from '@/lib/sso/sso-service'
import { revalidatePath } from 'next/cache'

const SESSION_COOKIE_NAME = 'lam_customer_session'
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.lubbalmandumah.com' : undefined

export async function getSafeReturnUrl(returnTo: string | undefined): Promise<string> {
  const isProd = process.env.NODE_ENV === 'production'
  const defaultTarget = isProd ? 'https://access.lubbalmandumah.com/portal' : '/portal'

  if (!returnTo) return defaultTarget

  const trimmed = returnTo.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()
    if (
      host === 'lubbalmandumah.com' ||
      host.endsWith('.lubbalmandumah.com') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    ) {
      return trimmed
    }
  } catch {}

  return defaultTarget
}

export interface CustomerLoginResult {
  success: boolean
  error?: string
  redirectUrl?: string
  customerId?: string
  requirePasswordChange?: boolean
  workspaceId?: string
  workspaceCode?: string
  productSlug?: string
}

export async function customerLogin(formDataInput: FormData | Record<string, any>): Promise<CustomerLoginResult> {
  const isFormData = typeof FormData !== 'undefined' && formDataInput instanceof FormData
  const getValue = (key: string, altKey?: string) => {
    if (isFormData) {
      const val = (formDataInput as FormData).get(key)
      return val ? String(val) : altKey ? ((formDataInput as FormData).get(altKey) ? String((formDataInput as FormData).get(altKey)) : undefined) : undefined
    }
    const obj = formDataInput as Record<string, any>
    return obj[key] !== undefined ? String(obj[key]) : altKey && obj[altKey] !== undefined ? String(obj[altKey]) : undefined
  }

  const mode = getValue('login_mode', 'loginType') || 'employee'
  const workspaceCode = getValue('workspace_code', 'workspaceCode')?.trim().toUpperCase()
  const userId = getValue('user_id', 'userId')?.trim().toLowerCase()
  const email = getValue('email')?.trim().toLowerCase()
  const password = getValue('password') || ''
  const returnTo = getValue('return_to', 'returnTo')
  const safeReturnTo = await getSafeReturnUrl(returnTo)
  const requestingProduct = getValue('requesting_product', 'requestingProduct')?.trim().toLowerCase()

  // If workspace_code & user_id are supplied OR mode === 'employee', process workspace login
  if (workspaceCode && userId) {
    return customerWorkspaceLogin({
      workspaceCode,
      userId,
      password,
      safeReturnTo,
      requestingProduct
    })
  }

  if (!email || !password) {
    return { success: false, error: 'Email and password are required for Owner Sign In.' }
  }

  const authClient = getSupabaseAdmin()
  const adminClient = getSupabaseAdmin()

  // 1. Verify credentials against canonical Supabase Auth (auth.users)
  const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
    email,
    password
  })

  let authUserId = authData?.user?.id

  if (authErr || !authUserId) {
    const { data: custAttempt } = await adminClient
      .from('customer_identities')
      .select('id')
      .ilike('email', email)
      .maybeSingle()

    await logCustomerAudit(custAttempt?.id || null, null, 'owner_login_failed_password', { email, authError: authErr?.message })
    return { success: false, error: 'Invalid Owner email or password.' }
  }

  // 2. Fetch linked customer identity profile
  let { data: customer, error: profileErr } = await adminClient
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (!customer) {
    const { data: custByEmail, error: emailErr } = await adminClient
      .from('customer_identities')
      .select('*')
      .ilike('email', email)
      .maybeSingle()

    customer = custByEmail
    if (emailErr) profileErr = emailErr
  }

  if (profileErr || !customer) {
    await logCustomerAudit(null, null, 'owner_login_failed_profile_missing', { email, authUserId })
    return { success: false, error: 'Customer Owner profile not found.' }
  }

  if (customer.status === 'suspended') {
    await logCustomerAudit(customer.id, null, 'owner_login_blocked_suspended', { email })
    return { success: false, error: 'Owner Account is suspended. Please contact LAM Administration.' }
  }

  // Auto-stitch auth_user_id if unlinked
  if (!customer.auth_user_id) {
    await adminClient.from('customer_identities').update({ auth_user_id: authUserId }).eq('id', customer.id)
  }

  // Check mandatory first-login password change requirement
  const isMustChangePassword = customer.must_change_password === true || authData.user?.user_metadata?.must_change_password === true

  if (isMustChangePassword) {
    try {
      const cookieStore = await cookies()
      const pendingToken = crypto.randomUUID()
      cookieStore.set('lam_pending_pwd_change', JSON.stringify({ authUserId, customerId: customer.id, returnTo: safeReturnTo, token: pendingToken }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600
      })
    } catch {}

    await logCustomerAudit(customer.id, null, 'login_forced_password_change_required', { email })

    return {
      success: true,
      requirePasswordChange: true,
      redirectUrl: `/id/force-password-change?return_to=${encodeURIComponent(safeReturnTo)}`
    }
  }

  const sessionToken = 'csess_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString()

  await adminClient.from('customer_sessions').insert({
    customer_id: customer.id,
    session_token: sessionToken,
    expires_at: expiresAt,
    is_active: true
  })

  await adminClient
    .from('customer_identities')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', customer.id)

  try {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: COOKIE_DOMAIN,
      maxAge: 30 * 86400
    })
  } catch {}

  await logCustomerAudit(customer.id, null, 'customer_owner_login_success', { email })

  return { success: true, redirectUrl: safeReturnTo, customerId: customer.id }
}

/**
 * Perform workspace employee authentication via Workspace Code (PPPXXXX) + User ID + Password
 */
export async function customerWorkspaceLogin(params: {
  workspaceCode: string
  userId: string
  password?: string
  safeReturnTo?: string
  requestingProduct?: string
}): Promise<CustomerLoginResult> {
  const { workspaceCode, userId, password, safeReturnTo = '/portal', requestingProduct } = params

  if (!workspaceCode || !userId || !password) {
    return { success: false, error: 'Workspace Code, User ID, and Password are required.' }
  }

  const supabase = getSupabaseAdmin()

  // 1. Resolve Product Workspace
  const { data: workspace, error: wsErr } = await supabase
    .from('lam_product_workspaces')
    .select('*, customer_account:lam_customer_accounts(*), organization:lam_organizations(*)')
    .ilike('workspace_code', workspaceCode)
    .maybeSingle()

  if (wsErr || !workspace) {
    return { success: false, error: `Workspace '${workspaceCode}' was not found.` }
  }

  if (workspace.status !== 'active') {
    return { success: false, error: `Workspace '${workspaceCode}' is currently ${workspace.status}.` }
  }

  // 2. Check Product Identity Mode in Central Product Registry
  const { data: productReg } = await supabase
    .from('lam_products')
    .select('identity_mode, name')
    .eq('slug', workspace.product_slug)
    .maybeSingle()

  if (productReg?.identity_mode !== 'lam_sso') {
    return { success: false, error: `Product '${productReg?.name || workspace.product_slug}' does not participate in central LAM SSO authentication.` }
  }

  // 3. Verify requesting product match (if login originated from specific product OIDC request)
  if (requestingProduct && requestingProduct !== workspace.product_slug) {
    return {
      success: false,
      error: `Workspace Code '${workspaceCode}' belongs to ${workspace.product_slug.toUpperCase()}, which cannot be used to log into ${requestingProduct.toUpperCase()}.`
    }
  }

  // 4. Check cascading suspension status (Customer Account -> Organization)
  if (workspace.customer_account?.status === 'suspended') {
    return { success: false, error: 'Customer Account is suspended. Please contact LAM Administration.' }
  }

  if (workspace.organization?.status === 'suspended') {
    return { success: false, error: 'Organization is suspended. Please contact your administrator.' }
  }

  // 5. Resolve Workspace Membership
  const { data: membership, error: memErr } = await supabase
    .from('lam_workspace_memberships')
    .select('*, customer:customer_identities(*)')
    .eq('workspace_id', workspace.id)
    .ilike('user_id', userId)
    .maybeSingle()

  if (memErr || !membership) {
    return { success: false, error: `Invalid User ID or password for workspace '${workspaceCode}'.` }
  }

  if (membership.status !== 'active') {
    return { success: false, error: `Your account for workspace '${workspaceCode}' is ${membership.status}.` }
  }

  const customer = membership.customer as any
  if (!customer || customer.status !== 'active') {
    return { success: false, error: `Your account identity for workspace '${workspaceCode}' is inactive or suspended.` }
  }

  // 6. Determine Internal Auth Email Alias (Encapsulated)
  const internalAuthEmail = customer.email || `${userId}.${workspaceCode}@users.lam.internal`

  // 7. Validate Password against central Supabase Auth (auth.users)
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: internalAuthEmail,
    password
  })

  if (authErr || !authData.user) {
    await logCustomerAudit(customer.id, workspace.customer_account_id, 'workspace_login_failed_password', {
      workspaceCode,
      userId,
      authError: authErr?.message
    })
    return { success: false, error: `Invalid User ID or password for workspace '${workspaceCode}'.` }
  }

  // Auto-stitch auth_user_id if unlinked
  if (!customer.auth_user_id) {
    await supabase.from('customer_identities').update({ auth_user_id: authData.user.id }).eq('id', customer.id)
  }

  // 8. Issue Active Customer Session
  const sessionToken = 'csess_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString()

  await supabase.from('customer_sessions').insert({
    customer_id: customer.id,
    session_token: sessionToken,
    expires_at: expiresAt,
    is_active: true
  })

  await supabase
    .from('customer_identities')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', customer.id)

  try {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: COOKIE_DOMAIN,
      maxAge: 30 * 86400
    })
  } catch {}

  await logCustomerAudit(customer.id, workspace.customer_account_id, 'workspace_login_success', {
    workspaceCode,
    userId,
    productSlug: workspace.product_slug
  })

  return {
    success: true,
    redirectUrl: safeReturnTo,
    customerId: customer.id,
    workspaceId: workspace.id,
    workspaceCode: workspace.workspace_code,
    productSlug: workspace.product_slug
  }
}

/**
 * Create a new independent workspace employee account (Customer Identity + Auth user + Membership)
 */
export async function createWorkspaceEmployeeAccount(params: {
  workspaceId?: string
  workspace_id?: string
  workspaceCode?: string
  workspace_code?: string
  userId?: string
  user_id?: string
  password?: string
  initial_password?: string
  firstName?: string
  first_name?: string
  lastName?: string
  last_name?: string
  workspaceRole?: string
  role?: string
  contactEmail?: string
}) {
  const wsId = params.workspaceId || params.workspace_id
  const wsCode = params.workspaceCode || params.workspace_code
  const uId = params.userId || params.user_id
  const pwd = params.password || params.initial_password
  const fName = params.firstName || params.first_name || 'Employee'
  const lName = params.lastName || params.last_name || ''
  const wRole = params.workspaceRole || params.role || 'member'

  const supabase = getSupabaseAdmin()

  // 1. Verify target workspace exists and product uses lam_sso
  let wsQuery = supabase
    .from('lam_product_workspaces')
    .select('id, workspace_code, product_slug, max_seats')

  if (wsId) {
    wsQuery = wsQuery.eq('id', wsId)
  } else if (wsCode) {
    wsQuery = wsQuery.ilike('workspace_code', wsCode)
  } else {
    return { success: false, error: 'Target workspace_id or workspace_code is required.' }
  }

  const { data: workspace, error: wsErr } = await wsQuery.maybeSingle()

  if (wsErr || !workspace) {
    return { success: false, error: 'Target product workspace not found.' }
  }

  const userId = uId!
  const password = pwd
  const firstName = fName
  const lastName = lName
  const workspaceRole = wRole

  // 1b. Check active seat usage against max_seats limit
  const { count: activeSeats } = await supabase
    .from('lam_workspace_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)
    .eq('status', 'active')

  if (activeSeats !== null && activeSeats >= workspace.max_seats) {
    return {
      success: false,
      error: `Seat limit reached (${activeSeats}/${workspace.max_seats} active seats). Please upgrade your plan tier to add more users.`
    }
  }

  const { data: prod } = await supabase.from('lam_products').select('identity_mode').eq('slug', workspace.product_slug).single()
  if (prod?.identity_mode !== 'lam_sso') {
    return { success: false, error: 'Workspace product does not participate in central LAM SSO.' }
  }

  // 2. Check user_id uniqueness within workspace scope
  const cleanUserId = userId.trim().toLowerCase()
  const { data: existingMem } = await supabase
    .from('lam_workspace_memberships')
    .select('id')
    .eq('workspace_id', workspace.id)
    .ilike('user_id', cleanUserId)
    .maybeSingle()

  if (existingMem) {
    return { success: false, error: `User ID '${cleanUserId}' is already taken in workspace '${workspace.workspace_code}'.` }
  }

  // 3. Generate initial password if omitted
  const initialPassword = password && password.length >= 8 ? password : `LAM-Init-${Math.floor(100000 + Math.random() * 900000)}!`

  // 4. Generate internal auth email alias
  const internalAuthEmail = `${cleanUserId}.${workspace.workspace_code.toLowerCase()}@users.lam.internal`

  // 5. Create independent Auth user in auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: internalAuthEmail,
    password: initialPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName || '',
      workspace_code: workspace.workspace_code,
      user_id: cleanUserId,
      role: 'workspace_employee'
    }
  })

  if (authError || !authUser?.user) {
    return { success: false, error: `Failed to create workspace Auth user: ${authError?.message}` }
  }

  const authUserId = authUser.user.id

  const contactEmail = params.contactEmail || null

  // 6. Create independent linked customer_identities row
  const { data: newCustomer, error: custError } = await supabase
    .from('customer_identities')
    .insert({
      id: authUserId,
      auth_user_id: authUserId,
      email: contactEmail || internalAuthEmail,
      first_name: firstName,
      last_name: lastName || null,
      status: 'active'
    })
    .select()
    .single()

  if (custError || !newCustomer) {
    return { success: false, error: `Failed to create customer identity profile: ${custError?.message}` }
  }

  // 7. Create workspace membership
  const { data: newMem, error: memError } = await supabase
    .from('lam_workspace_memberships')
    .insert({
      workspace_id: workspace.id,
      customer_id: newCustomer.id,
      user_id: cleanUserId,
      workspace_role: workspaceRole,
      status: 'active'
    })
    .select()
    .single()

  if (memError || !newMem) {
    return { success: false, error: `Failed to create workspace membership: ${memError?.message}` }
  }

  return {
    success: true,
    customerId: newCustomer.id,
    authUserId,
    membershipId: newMem.id,
    workspaceCode: workspace.workspace_code,
    userId: cleanUserId,
    initialPassword
  }
}

export async function completeFirstPasswordChange(formData: FormData) {
  const newPassword = (formData.get('new_password') as string)?.trim()
  const confirmPassword = (formData.get('confirm_password') as string)?.trim()

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  let pendingCookie: string | undefined
  try {
    const cookieStore = await cookies()
    pendingCookie = cookieStore.get('lam_pending_pwd_change')?.value
  } catch {}

  if (!pendingCookie) {
    return { success: false, error: 'Password change session expired or invalid. Please log in again.' }
  }

  try {
    const { authUserId, customerId, returnTo } = JSON.parse(pendingCookie)
    const supabase = getSupabaseAdmin()

    // Update password in Supabase Auth & metadata
    const { error: authErr } = await supabase.auth.admin.updateUserById(authUserId, {
      password: newPassword,
      user_metadata: { must_change_password: false }
    })

    if (authErr) {
      return { success: false, error: `Failed to update password: ${authErr.message}` }
    }

    // Update customer_identities
    await supabase
      .from('customer_identities')
      .update({ must_change_password: false, updated_at: new Date().toISOString() })
      .eq('id', customerId)

    // Issue active session token
    const sessionToken = 'csess_' + crypto.randomUUID().replace(/-/g, '')
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString()

    await supabase.from('customer_sessions').insert({
      customer_id: customerId,
      session_token: sessionToken,
      expires_at: expiresAt,
      is_active: true
    })

    try {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: COOKIE_DOMAIN,
        maxAge: 30 * 86400
      })

      cookieStore.delete('lam_pending_pwd_change')
    } catch {}

    await logCustomerAudit(customerId, null, 'first_login_password_changed', {})

    const safeReturnTo = (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) ? returnTo : '/portal'
    return { success: true, redirectUrl: safeReturnTo }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to complete password change.' }
  }
}

export async function getCurrentCustomer() {
  let sessionToken: string | undefined
  try {
    const cookieStore = await cookies()
    sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  } catch {}

  if (!sessionToken) return null

  const supabase = getSupabaseAdmin()

  const { data: session } = await supabase
    .from('customer_sessions')
    .select('*, customer:customer_identities(*)')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!session || !session.customer) return null
  if (session.customer.status === 'suspended') return null

  return session.customer
}

export async function customerLogout() {
  let sessionToken: string | undefined
  try {
    const cookieStore = await cookies()
    sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  } catch {}

  if (sessionToken) {
    const supabase = getSupabaseAdmin()
    await supabase
      .from('customer_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken)
  }

  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    if (COOKIE_DOMAIN) {
      cookieStore.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        domain: COOKIE_DOMAIN,
        maxAge: 0
      })
    }
  } catch {}

  return { success: true }
}

export async function updateCustomerPassword(formData: FormData) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const newPassword = formData.get('new_password') as string
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  const supabase = getSupabaseAdmin()

  if (currentCustomer.auth_user_id) {
    const { error: authErr } = await supabase.auth.admin.updateUserById(currentCustomer.auth_user_id, {
      password: newPassword
    })
    if (authErr) return { success: false, error: authErr.message }
  }

  await logCustomerAudit(currentCustomer.id, null, 'customer_password_changed', {})
  return { success: true }
}

// --------------------------------------------------------------------------
// PORTAL & TEAM HELPER ACTIONS (PRESERVED FOR COMPATIBILITY)
// --------------------------------------------------------------------------

export async function customerRegister(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const companyName = (formData.get('company_name') as string)?.trim()

  if (!email || !password || !firstName || !companyName) {
    return { success: false, error: 'Please fill in all required fields.' }
  }

  const supabase = getSupabaseAdmin()

  const { data: existing } = await supabase
    .from('customer_identities')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName || '',
      role: 'customer'
    }
  })

  if (authError || !authUser?.user) {
    return { success: false, error: `Account registration failed: ${authError?.message}` }
  }

  const authUserId = authUser.user.id

  const { data: newCustomer, error: custError } = await supabase
    .from('customer_identities')
    .insert({
      id: authUserId,
      auth_user_id: authUserId,
      email,
      first_name: firstName,
      last_name: lastName || null,
      status: 'active'
    })
    .select('id')
    .single()

  if (custError || !newCustomer) {
    return { success: false, error: `Failed to create customer profile: ${custError?.message}` }
  }

  const companyIdStr = `COMP-${Math.floor(10000 + Math.random() * 90000)}`
  const { data: company, error: compError } = await supabase
    .from('crm_companies')
    .insert({
      company_id: companyIdStr,
      name: companyName,
      legal_name: companyName,
      status: 'Active',
      source: 'Self-Service Sign Up'
    })
    .select('id')
    .single()

  if (compError || !company) {
    return { success: false, error: `Failed to create company: ${compError?.message}` }
  }

  await supabase.from('customer_company_memberships').insert({
    customer_id: newCustomer.id,
    company_id: company.id,
    company_role: 'owner',
    status: 'active'
  })

  const sessionToken = 'csess_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString()

  await supabase.from('customer_sessions').insert({
    customer_id: newCustomer.id,
    session_token: sessionToken,
    expires_at: expiresAt,
    is_active: true
  })

  try {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 86400
    })
  } catch {}

  await logCustomerAudit(newCustomer.id, company.id, 'customer_registered', { email, companyName })

  return { success: true, redirectUrl: '/portal' }
}

export async function inviteTeamMember(formData: FormData) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const companyId = formData.get('company_id') as string
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role = (formData.get('role') as string) || 'member'
  const productSlugs = formData.getAll('product_slugs') as string[]

  if (!companyId || !email) {
    return { success: false, error: 'Company ID and email are required.' }
  }

  const supabase = getSupabaseAdmin()

  const token = 'inv_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: invitation, error } = await supabase
    .from('customer_invitations')
    .insert({
      token,
      company_id: companyId,
      email,
      role,
      product_slugs: productSlugs.length > 0 ? productSlugs : ['nexora'],
      invited_by: currentCustomer.id,
      expires_at: expiresAt,
      status: 'pending'
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logCustomerAudit(currentCustomer.id, companyId, 'team_member_invited', { email, role })
  revalidatePath('/portal/team')

  return { success: true, token, invitation }
}

export async function grantUserProductAccess(targetCustomerId: string, companyId: string, productSlug: string) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const supabase = getSupabaseAdmin()

  const { data: actorMem } = await supabase
    .from('customer_company_memberships')
    .select('company_role')
    .eq('customer_id', currentCustomer.id)
    .eq('company_id', companyId)
    .eq('status', 'active')
    .single()

  if (!actorMem || !['owner', 'admin'].includes(actorMem.company_role)) {
    return { success: false, error: 'Only organization Owners or Admins can modify product access.' }
  }

  const { error } = await supabase
    .from('customer_product_access')
    .upsert(
      {
        customer_id: targetCustomerId,
        company_id: companyId,
        product_slug: productSlug,
        status: 'active',
        granted_by: currentCustomer.id,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'customer_id,company_id,product_slug' }
    )

  if (error) return { success: false, error: error.message }

  await logCustomerAudit(currentCustomer.id, companyId, 'user_product_access_granted', {
    target_customer_id: targetCustomerId,
    product_slug: productSlug
  })

  revalidatePath('/portal/team')
  return { success: true }
}

export async function revokeUserProductAccess(targetCustomerId: string, companyId: string, productSlug: string) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const supabase = getSupabaseAdmin()

  const { data: actorMem } = await supabase
    .from('customer_company_memberships')
    .select('company_role')
    .eq('customer_id', currentCustomer.id)
    .eq('company_id', companyId)
    .eq('status', 'active')
    .single()

  if (!actorMem || !['owner', 'admin'].includes(actorMem.company_role)) {
    return { success: false, error: 'Only organization Owners or Admins can modify product access.' }
  }

  const { error } = await supabase
    .from('customer_product_access')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('customer_id', targetCustomerId)
    .eq('company_id', companyId)
    .eq('product_slug', productSlug)

  if (error) return { success: false, error: error.message }

  await logCustomerAudit(currentCustomer.id, companyId, 'user_product_access_revoked', {
    target_customer_id: targetCustomerId,
    product_slug: productSlug
  })

  revalidatePath('/portal/team')
  return { success: true }
}

export async function updateCompanyProfile(companyId: string, formData: FormData) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const name = (formData.get('name') as string)?.trim()
  const legalName = (formData.get('legal_name') as string)?.trim()
  const country = (formData.get('country') as string)?.trim()
  const website = (formData.get('website') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()

  if (!name) return { success: false, error: 'Company name is required.' }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('crm_companies')
    .update({
      name,
      legal_name: legalName || name,
      country: country || null,
      website: website || null,
      phone: phone || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)

  if (error) return { success: false, error: error.message }

  await logCustomerAudit(currentCustomer.id, companyId, 'company_profile_updated', { name })
  revalidatePath('/portal/company')
  return { success: true }
}

export async function updateCustomerProfile(formData: FormData) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()

  if (!firstName) return { success: false, error: 'First name is required.' }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('customer_identities')
    .update({
      first_name: firstName,
      last_name: lastName || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentCustomer.id)

  if (error) return { success: false, error: error.message }

  await logCustomerAudit(currentCustomer.id, null, 'customer_profile_updated', { firstName, lastName })
  revalidatePath('/portal/profile')
  return { success: true }
}

export async function submitCustomerSupportTicket(formData: FormData) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const subject = (formData.get('subject') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!subject || !message) {
    return { success: false, error: 'Subject and message are required.' }
  }

  await logCustomerAudit(currentCustomer.id, null, 'support_ticket_submitted', { subject })
  return { success: true, ticketId: `TICK-${Math.floor(100000 + Math.random() * 900000)}` }
}

// --------------------------------------------------------------------------
// STAGE D: OWNER CONSOLE & STRICT EMPLOYEE ISOLATION ACTIONS
// --------------------------------------------------------------------------

export async function getOwnerConsoleData(overrideCustomerId?: string) {
  const currentCustomer = overrideCustomerId
    ? { id: overrideCustomerId }
    : await getCurrentCustomer()
  if (!currentCustomer) return { isOwner: false, error: 'Unauthorized' }

  const supabase = getSupabaseAdmin()

  // 1. Check if user is a Company Owner / Admin
  const { data: compMem } = await supabase
    .from('customer_company_memberships')
    .select('company_id, company_role, company:crm_companies(*)')
    .eq('customer_id', currentCustomer.id)
    .eq('status', 'active')
    .maybeSingle()

  const isOwner = compMem && ['owner', 'admin'].includes(compMem.company_role)

  if (!isOwner) {
    return { isOwner: false }
  }

  // 2. Resolve Customer Account & Hierarchy
  const company = (compMem as any)?.company
  let customerAccountId = company?.customer_account_id

  if (!customerAccountId && company?.name) {
    const { data: ca } = await supabase
      .from('lam_customer_accounts')
      .select('id')
      .ilike('name', company.name)
      .maybeSingle()
    customerAccountId = ca?.id
  }

  if (!customerAccountId) {
    return { isOwner: true, customerAccount: null, organizations: [], workspaces: [] }
  }

  // Fetch Customer Account Detail
  const { data: customerAccount } = await supabase
    .from('lam_customer_accounts')
    .select('*')
    .eq('id', customerAccountId)
    .single()

  // Fetch Organizations
  const { data: organizations } = await supabase
    .from('lam_organizations')
    .select('*')
    .eq('customer_account_id', customerAccountId)

  // Fetch Product Workspaces
  const { data: rawWorkspaces } = await supabase
    .from('lam_product_workspaces')
    .select('*, organization:lam_organizations(name, organization_code)')
    .eq('customer_account_id', customerAccountId)

  // Fetch SSO Products Registry
  const { data: ssoProducts } = await supabase
    .from('lam_products')
    .select('*')

  const prodMap = new Map((ssoProducts || []).map(p => [p.slug, p]))

  // Process Workspaces with Active Seat Usage Calculation
  const workspaces = await Promise.all((rawWorkspaces || []).map(async ws => {
    const prodInfo = prodMap.get(ws.product_slug) || {
      name: ws.product_slug.toUpperCase(),
      identity_mode: 'lam_sso',
      client_id: `lam_app_${ws.product_slug}`,
      app_url: `https://${ws.product_slug}.lubbalmandumah.com`
    }

    // Active seat usage calculation per workspace/product
    const { count: activeSeats } = await supabase
      .from('lam_workspace_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', ws.id)
      .eq('status', 'active')

    // Fetch workspace members
    const { data: rawMembers } = await supabase
      .from('lam_workspace_memberships')
      .select('*, customer:customer_identities(*)')
      .eq('workspace_id', ws.id)

    const members = (rawMembers || []).map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      workspaceRole: m.workspace_role,
      status: m.status,
      customerName: m.customer ? `${m.customer.first_name || ''} ${m.customer.last_name || ''}`.trim() : 'N/A',
      authUserId: m.customer?.auth_user_id || m.customer?.id,
      customerStatus: m.customer?.status || 'active',
      createdAt: m.created_at
    }))

    const ssoLaunchUrl = `/api/sso/authorize?client_id=${prodInfo.client_id || 'lam_app_' + ws.product_slug}&product=${ws.product_slug}&workspace=${ws.workspace_code}&redirect_uri=${encodeURIComponent((prodInfo.app_url || `https://${ws.product_slug}.lubbalmandumah.com`) + '/auth/callback')}`

    return {
      id: ws.id,
      workspaceCode: ws.workspace_code,
      productSlug: ws.product_slug,
      productName: prodInfo.name,
      identityMode: prodInfo.identity_mode || 'lam_sso',
      appUrl: prodInfo.app_url,
      planTier: ws.plan_tier,
      maxSeats: ws.max_seats,
      activeSeats: activeSeats || 0,
      status: ws.status,
      organizationId: ws.organization_id,
      organizationName: (ws as any).organization?.name || 'N/A',
      members,
      ssoLaunchUrl
    }
  }))

  return {
    isOwner: true,
    customerAccount,
    organizations: organizations || [],
    workspaces,
    ssoProducts: (ssoProducts || []).filter(p => p.identity_mode === 'lam_sso')
  }
}

export async function getEmployeeWorkspaceData() {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return null

  const supabase = getSupabaseAdmin()

  // STRICT EMPLOYEE ISOLATION: Fetch ONLY memberships belonging to current customer
  const { data: memberships } = await supabase
    .from('lam_workspace_memberships')
    .select('*, workspace:lam_product_workspaces(*)')
    .eq('customer_id', currentCustomer.id)
    .eq('status', 'active')

  if (!memberships || memberships.length === 0) {
    return []
  }

  const { data: ssoProducts } = await supabase.from('lam_products').select('*')
  const prodMap = new Map((ssoProducts || []).map(p => [p.slug, p]))

  // Return strictly isolated assigned workspace data
  return memberships.map((m: any) => {
    const ws = m.workspace
    const prod = prodMap.get(ws.product_slug)
    const appUrl = prod?.app_url || `https://${ws.product_slug}.lubbalmandumah.com`
    const ssoLaunchUrl = `/api/sso/authorize?client_id=${prod?.client_id || 'lam_app_' + ws.product_slug}&product=${ws.product_slug}&workspace=${ws.workspace_code}&redirect_uri=${encodeURIComponent(appUrl + '/auth/callback')}`

    return {
      workspaceCode: ws.workspace_code,
      productSlug: ws.product_slug,
      productName: prod?.name || ws.product_slug.toUpperCase(),
      userId: m.user_id,
      role: m.workspace_role,
      status: m.status,
      ssoLaunchUrl
    }
  })
}

export async function updateWorkspaceUserStatusAction(params: {
  workspaceId: string
  membershipId: string
  newStatus: 'active' | 'suspended'
}) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const { workspaceId, membershipId, newStatus } = params
  const supabase = getSupabaseAdmin()

  // 1. Verify caller is Company Owner/Admin
  const ownerData = await getOwnerConsoleData()
  if (!ownerData.isOwner) {
    return { success: false, error: 'Only Company Owners can update workspace user status.' }
  }

  const ws = ownerData.workspaces?.find((w: any) => w.id === workspaceId)
  if (!ws) {
    return { success: false, error: 'Workspace not found or unauthorized.' }
  }

  // 2. Seat limit check if reactivating user
  if (newStatus === 'active' && ws.activeSeats >= ws.maxSeats) {
    return {
      success: false,
      error: `Seat limit reached (${ws.activeSeats}/${ws.maxSeats} active seats). Please upgrade your plan tier to activate more users.`
    }
  }

  // 3. Update membership status
  const { data: mem, error: memErr } = await supabase
    .from('lam_workspace_memberships')
    .update({ status: newStatus })
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .select('customer_id')
    .single()

  if (memErr || !mem) {
    return { success: false, error: `Failed to update membership status: ${memErr?.message}` }
  }

  // Update linked customer identity status
  await supabase.from('customer_identities').update({ status: newStatus }).eq('id', mem.customer_id)

  await logCustomerAudit(currentCustomer.id, null, `workspace_user_${newStatus}`, { workspaceId, membershipId, targetCustomerId: mem.customer_id })
  revalidatePath('/portal')
  return { success: true }
}

export async function resetWorkspaceUserPasswordAction(params: {
  workspaceId: string
  authUserId: string
}) {
  const currentCustomer = await getCurrentCustomer()
  if (!currentCustomer) return { success: false, error: 'Unauthorized.' }

  const { workspaceId, authUserId } = params
  const supabase = getSupabaseAdmin()

  // Verify caller is Company Owner/Admin
  const ownerData = await getOwnerConsoleData()
  if (!ownerData.isOwner) {
    return { success: false, error: 'Only Company Owners can reset workspace user passwords.' }
  }

  const newPassword = `LAM-Reset-${Math.floor(100000 + Math.random() * 900000)}!`

  const { error: authErr } = await supabase.auth.admin.updateUserById(authUserId, {
    password: newPassword,
    user_metadata: { must_change_password: true }
  })

  if (authErr) {
    return { success: false, error: `Failed to reset password: ${authErr.message}` }
  }

  await supabase.from('customer_identities').update({ must_change_password: true }).eq('id', authUserId)

  await logCustomerAudit(currentCustomer.id, null, 'workspace_user_password_reset', { workspaceId, authUserId })
  return { success: true, newPassword }
}
