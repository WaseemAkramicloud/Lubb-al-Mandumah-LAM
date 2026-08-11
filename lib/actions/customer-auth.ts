'use server'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logCustomerAudit } from '@/lib/sso/sso-service'
import { revalidatePath } from 'next/cache'

const SESSION_COOKIE_NAME = 'lam_customer_session'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'lam_salt_2026').digest('hex')
}

export async function customerLogin(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const returnTo = (formData.get('return_to') as string) || '/portal'
  const safeReturnTo = (returnTo.startsWith('/') && !returnTo.startsWith('//')) ? returnTo : '/portal'

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const supabase = getSupabaseAdmin()

  const { data: customer, error } = await supabase
    .from('customer_identities')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !customer) {
    return { success: false, error: 'Invalid customer email or password.' }
  }

  if (customer.status === 'suspended') {
    await logCustomerAudit(customer.id, null, 'login_blocked_suspended', { email })
    return { success: false, error: 'Account suspended. Please contact your organization administrator.' }
  }

  const passwordHash = hashPassword(password)
  if (customer.password_hash !== passwordHash) {
    await logCustomerAudit(customer.id, null, 'login_failed_password', { email })
    return { success: false, error: 'Invalid customer email or password.' }
  }

  const sessionToken = 'csess_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString() // 30 days

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

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 86400
  })

  await logCustomerAudit(customer.id, null, 'customer_login_success', { email })

  return { success: true, redirectUrl: safeReturnTo, customerId: customer.id }
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) return null

  const supabase = getSupabaseAdmin()

  const { data: session } = await supabase
    .from('customer_sessions')
    .select('*, customer:customer_identities(*)')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session || !session.customer) return null
  if (session.customer.status === 'suspended') return null

  return session.customer
}

export async function customerLogout() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    const supabase = getSupabaseAdmin()
    await supabase
      .from('customer_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken)
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
  return { success: true }
}

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
    .single()

  if (existing) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  const passwordHash = hashPassword(password)
  const { data: newCustomer, error: custError } = await supabase
    .from('customer_identities')
    .insert({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName || null,
      status: 'active'
    })
    .select('id')
    .single()

  if (custError || !newCustomer) {
    return { success: false, error: custError?.message || 'Failed to create customer account.' }
  }

  const { data: seqResult } = await supabase.rpc('nextval', { seq_name: 'crm_company_id_seq' }).single()
  const companyIdCode = 'LAM-C-' + String(seqResult || Date.now()).padStart(6, '0')

  const { data: newCompany, error: compError } = await supabase
    .from('crm_companies')
    .insert({
      company_id: companyIdCode,
      name: companyName,
      email,
      status: 'Active',
      source: 'LAM ID Registration'
    })
    .select('id')
    .single()

  if (compError || !newCompany) {
    return { success: false, error: 'Failed to create organization.' }
  }

  await supabase.from('customer_company_memberships').insert({
    customer_id: newCustomer.id,
    company_id: newCompany.id,
    company_role: 'owner',
    status: 'active'
  })

  // Seed default demo entitlements
  await supabase.from('customer_product_entitlements').insert([
    { company_id: newCompany.id, product_slug: 'nexora', plan_tier: 'standard', max_seats: 5, status: 'active' },
    { company_id: newCompany.id, product_slug: 'atom', plan_tier: 'standard', max_seats: 5, status: 'active' }
  ])

  // Explicit user grants
  await supabase.from('customer_product_access').insert([
    { customer_id: newCustomer.id, company_id: newCompany.id, product_slug: 'nexora', status: 'active' },
    { customer_id: newCustomer.id, company_id: newCompany.id, product_slug: 'atom', status: 'active' }
  ])

  await logCustomerAudit(newCustomer.id, newCompany.id, 'account_registered', { company_name: companyName })

  const loginForm = new FormData()
  loginForm.append('email', email)
  loginForm.append('password', password)
  return await customerLogin(loginForm)
}

/**
 * Grant User Product Access with Seat Limit & Entitlement Rules Verification.
 */
export async function grantUserProductAccess(companyId: string, customerId: string, productSlug: string) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const supabase = getSupabaseAdmin()

  // 1. Verify caller is Owner or Admin in company
  const { data: mem } = await supabase
    .from('customer_company_memberships')
    .select('company_role')
    .eq('customer_id', currentCust.id)
    .eq('company_id', companyId)
    .single()

  if (!mem || !['owner', 'admin'].includes(mem.company_role)) {
    throw new Error('Only Organization Owners or Admins can grant product access.')
  }

  // 2. CHECK ENTITLEMENT: Does company own active subscription for target product?
  const { data: entitlement } = await supabase
    .from('customer_product_entitlements')
    .select('id, max_seats, status')
    .eq('company_id', companyId)
    .eq('product_slug', productSlug)
    .eq('status', 'active')
    .maybeSingle()

  if (!entitlement) {
    throw new Error(`Your organization is not subscribed to ${productSlug.toUpperCase()}.`)
  }

  // 3. CHECK SEAT LIMIT: Count active user grants for this product in company
  const { count: activeGrantsCount } = await supabase
    .from('customer_product_access')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('product_slug', productSlug)
    .eq('status', 'active')
    .neq('customer_id', customerId) // excluding target if already active

  const maxSeats = entitlement.max_seats || 10
  if ((activeGrantsCount || 0) >= maxSeats) {
    throw new Error(`Seat limit reached for ${productSlug.toUpperCase()}. Max allowed seats: ${maxSeats}. Upgrade subscription to add more users.`)
  }

  // 4. Upsert Grant
  const { error } = await supabase
    .from('customer_product_access')
    .upsert({
      customer_id: customerId,
      company_id: companyId,
      product_slug: productSlug,
      status: 'active',
      granted_by: currentCust.id
    }, { onConflict: 'customer_id,company_id,product_slug' })

  if (error) throw new Error(error.message)

  await logCustomerAudit(currentCust.id, companyId, 'product_access_granted', { target_user: customerId, product_slug: productSlug })

  revalidatePath('/portal/team')
  revalidatePath('/portal/products')
  return { success: true }
}

export async function revokeUserProductAccess(companyId: string, customerId: string, productSlug: string) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const supabase = getSupabaseAdmin()

  const { data: mem } = await supabase
    .from('customer_company_memberships')
    .select('company_role')
    .eq('customer_id', currentCust.id)
    .eq('company_id', companyId)
    .single()

  if (!mem || !['owner', 'admin'].includes(mem.company_role)) {
    throw new Error('Only Organization Owners or Admins can revoke product access.')
  }

  const { error } = await supabase
    .from('customer_product_access')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('customer_id', customerId)
    .eq('company_id', companyId)
    .eq('product_slug', productSlug)

  if (error) throw new Error(error.message)

  await logCustomerAudit(currentCust.id, companyId, 'product_access_revoked', { target_user: customerId, product_slug: productSlug })

  revalidatePath('/portal/team')
  revalidatePath('/portal/products')
  return { success: true }
}

export async function inviteTeamMember(companyId: string, email: string, role: string, productSlugs: string[]) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const supabase = getSupabaseAdmin()
  const token = 'inv_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString()

  const { error } = await supabase.from('customer_invitations').insert({
    token,
    company_id: companyId,
    email: email.trim().toLowerCase(),
    role,
    product_slugs: productSlugs,
    invited_by: currentCust.id,
    expires_at: expiresAt,
    status: 'pending'
  })

  if (error) throw new Error(error.message)

  await logCustomerAudit(currentCust.id, companyId, 'team_invitation_sent', { invitee: email, product_slugs: productSlugs })

  revalidatePath('/portal/team')
  return { success: true, inviteLink: `/id/invite/${token}` }
}

export async function updateCustomerProfile(formData: FormData) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()

  if (!firstName) throw new Error('First name is required.')

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('customer_identities')
    .update({
      first_name: firstName,
      last_name: lastName || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentCust.id)

  if (error) throw new Error(error.message)

  await logCustomerAudit(currentCust.id, null, 'profile_updated', { first_name: firstName })

  revalidatePath('/portal/profile')
  return { success: true }
}

export async function updateCustomerPassword(formData: FormData) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string

  if (!currentPassword || !newPassword) throw new Error('All fields are required.')
  if (newPassword.length < 8) throw new Error('New password must be at least 8 characters.')

  const supabase = getSupabaseAdmin()

  const { data: customer } = await supabase
    .from('customer_identities')
    .select('password_hash')
    .eq('id', currentCust.id)
    .single()

  if (!customer || customer.password_hash !== hashPassword(currentPassword)) {
    throw new Error('Current password is incorrect.')
  }

  const { error } = await supabase
    .from('customer_identities')
    .update({
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString()
    })
    .eq('id', currentCust.id)

  if (error) throw new Error(error.message)

  await logCustomerAudit(currentCust.id, null, 'password_changed', {})

  revalidatePath('/portal/security')
  return { success: true }
}

export async function updateCompanyProfile(companyId: string, formData: FormData) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const supabase = getSupabaseAdmin()

  const { data: mem } = await supabase
    .from('customer_company_memberships')
    .select('company_role')
    .eq('customer_id', currentCust.id)
    .eq('company_id', companyId)
    .single()

  if (!mem || !['owner', 'admin'].includes(mem.company_role)) {
    throw new Error('Only Organization Owners or Admins can update organization profile.')
  }

  const payload = {
    name: formData.get('name') as string,
    legal_name: formData.get('legal_name') || null,
    website: formData.get('website') || null,
    phone: formData.get('phone') || null,
    country: formData.get('country') || null,
    city: formData.get('city') || null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('crm_companies')
    .update(payload)
    .eq('id', companyId)

  if (error) throw new Error(error.message)

  await logCustomerAudit(currentCust.id, companyId, 'company_profile_updated', payload)

  revalidatePath('/portal/company')
  return { success: true }
}

export async function submitCustomerSupportTicket(formData: FormData) {
  const currentCust = await getCurrentCustomer()
  if (!currentCust) throw new Error('Unauthenticated')

  const subject = (formData.get('subject') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()
  const category = formData.get('category') || 'General'

  if (!subject || !message) throw new Error('Subject and message are required.')

  await logCustomerAudit(currentCust.id, null, 'support_ticket_submitted', { subject, category })

  return { success: true }
}
