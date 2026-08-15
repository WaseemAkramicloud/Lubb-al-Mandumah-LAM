import { getSupabaseAdmin } from '@/lib/supabase/admin'

export interface AccessValidationResult {
  allowed: boolean
  reason?: string
  customer?: any
  company?: any
  companyRole?: string
  grantedProducts?: string[]
}

/**
 * Validates whether a customer identity has authorization to enter a specific product application.
 * 
 * CORE ARCHITECTURAL RULE:
 * 1. Customer identity must exist and be 'active' (not suspended).
 * 2. Customer must be an 'active' member of a company.
 * 3. The company must have an 'active' product entitlement for target product_slug.
 * 4. The user must have EXPLICIT user-level product access grant (customer_product_access) for product_slug.
 *    Being a company member does NOT automatically grant access to every product.
 */
export async function validateCustomerProductAccess(
  customerId: string,
  productSlug: string
): Promise<AccessValidationResult> {
  const supabase = getSupabaseAdmin()

  // 1. Fetch customer identity & check status
  const { data: customer, error: custError } = await supabase
    .from('customer_identities')
    .select('id, email, first_name, last_name, status')
    .eq('id', customerId)
    .single()

  if (custError || !customer) {
    return { allowed: false, reason: 'Customer identity not found.' }
  }

  if (customer.status === 'suspended') {
    return { allowed: false, reason: 'Account is suspended by administrator.' }
  }

  if (customer.status !== 'active') {
    return { allowed: false, reason: `Account status is ${customer.status}.` }
  }

  // 2. Fetch active company membership
  const { data: memberships, error: memError } = await supabase
    .from('customer_company_memberships')
    .select(`
      id, company_role, status, company_id,
      company:crm_companies (id, name, status)
    `)
    .eq('customer_id', customerId)
    .eq('status', 'active')

  if (memError || !memberships || memberships.length === 0) {
    return { allowed: false, reason: 'User does not belong to an active organization.' }
  }

  // Find membership where company is active and has entitlement + explicit access
  for (const mem of memberships) {
    const company = mem.company as any
    if (!company || company.status !== 'Active') continue

    // 3. Check Company Product Entitlement
    const { data: entitlement } = await supabase
      .from('customer_product_entitlements')
      .select('id, status, plan_tier')
      .eq('company_id', company.id)
      .eq('product_slug', productSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (!entitlement) continue

    // 4. Check Explicit User Product Access Grant
    const { data: explicitAccess } = await supabase
      .from('customer_product_access')
      .select('id, status')
      .eq('customer_id', customerId)
      .eq('company_id', company.id)
      .eq('product_slug', productSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (!explicitAccess) continue

    // Fetch all explicitly granted products for this user in this company (for token payload)
    const { data: allGranted } = await supabase
      .from('customer_product_access')
      .select('product_slug')
      .eq('customer_id', customerId)
      .eq('company_id', company.id)
      .eq('status', 'active')

    const grantedProducts = (allGranted || []).map(g => g.product_slug)

    return {
      allowed: true,
      customer,
      company,
      companyRole: mem.company_role,
      grantedProducts
    }
  }

  return {
    allowed: false,
    reason: `Access to product '${productSlug.toUpperCase()}' is not granted for your account or organization.`
  }
}

/**
 * Verify registered client application for OAuth SSO.
 */
export async function verifySsoClientApp(clientId: string, redirectUri: string) {
  const supabase = getSupabaseAdmin()

  const { data: app, error } = await supabase
    .from('sso_applications')
    .select('*')
    .eq('client_id', clientId)
    .single()

  if (error || !app) {
    return { valid: false, error: 'Unregistered client_id application.' }
  }

  // Check redirect URI match
  const uriMatch = app.redirect_uris.some((registeredUri: string) => {
    return redirectUri.startsWith(registeredUri) || registeredUri === redirectUri
  })

  if (!uriMatch) {
    return { valid: false, error: 'redirect_uri mismatch for client application.' }
  }

  return { valid: true, app }
}

/**
 * Generate authorization code for PKCE / OAuth SSO.
 */
export async function createAuthorizationCode(
  clientId: string,
  customerId: string,
  redirectUri: string,
  companyId?: string,
  scope: string = 'openid profile email',
  codeChallenge?: string,
  codeChallengeMethod?: string,
  nonce?: string
): Promise<string> {
  const supabase = getSupabaseAdmin()
  const code = 'code_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minute code expiry

  // Preserve scope strictly as 'openid profile email'
  const cleanScope = scope || 'openid profile email'

  const insertPayload: Record<string, any> = {
    code,
    client_id: clientId,
    customer_id: customerId,
    company_id: companyId || null,
    redirect_uri: redirectUri,
    scope: cleanScope,
    nonce: nonce || null,
    code_challenge: codeChallenge || null,
    code_challenge_method: codeChallengeMethod || null,
    expires_at: expiresAt,
    used: false
  }

  const { error } = await supabase.from('sso_auth_codes').insert(insertPayload)

  if (error) {
    // If dedicated nonce column is pending migration cache reload, store as dedicated challenge metadata
    delete insertPayload.nonce
    if (nonce) {
      insertPayload.code_challenge = (codeChallenge || '') + `;nonce=${nonce}`
    }
    const { error: err2 } = await supabase.from('sso_auth_codes').insert(insertPayload)
    if (err2) throw new Error(`Failed to generate auth code: ${err2.message}`)
  }

  return code
}

/**
 * Log customer security audit event.
 */
export async function logCustomerAudit(
  customerId: string | null,
  companyId: string | null,
  action: string,
  details: Record<string, any> = {},
  ipAddress?: string
) {
  const supabase = getSupabaseAdmin()
  await supabase.from('customer_audit_logs').insert({
    customer_id: customerId,
    company_id: companyId,
    action,
    details,
    ip_address: ipAddress || null
  })
}
