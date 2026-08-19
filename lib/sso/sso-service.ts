import { getSupabaseAdmin } from '@/lib/supabase/admin'

export interface AccessValidationResult {
  allowed: boolean
  reason?: string
  customer?: any
  company?: any
  workspace?: any
  workspaceRole?: string
}

/**
 * Validates whether a customer identity has authorization to enter a specific product application / workspace.
 */
export async function validateCustomerProductAccess(
  customerId: string,
  productSlug: string,
  requestedWorkspaceCode?: string
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

  // 2. Check Product Identity Mode in Central Product Registry
  const { data: prod } = await supabase
    .from('lam_products')
    .select('identity_mode, name')
    .eq('slug', productSlug)
    .maybeSingle()

  if (prod?.identity_mode !== 'lam_sso') {
    return { allowed: false, reason: `Product '${prod?.name || productSlug}' does not participate in central LAM SSO.` }
  }

  // 3. Resolve Workspace & Membership Context
  let workspaceQuery = supabase
    .from('lam_product_workspaces')
    .select('*, customer_account:lam_customer_accounts(*), organization:lam_organizations(*)')
    .eq('product_slug', productSlug)
    .eq('status', 'active')

  if (requestedWorkspaceCode) {
    workspaceQuery = workspaceQuery.ilike('workspace_code', requestedWorkspaceCode)
  }

  const { data: workspaces } = await workspaceQuery

  if (!workspaces || workspaces.length === 0) {
    return { allowed: false, reason: `No active '${productSlug.toUpperCase()}' workspace found.` }
  }

  // Check membership in resolved workspaces
  for (const ws of workspaces) {
    // Verify cascading suspension hierarchy
    if (ws.customer_account?.status === 'suspended') continue
    if (ws.organization?.status === 'suspended') continue

    // Check workspace membership
    const { data: mem } = await supabase
      .from('lam_workspace_memberships')
      .select('id, workspace_role, status')
      .eq('workspace_id', ws.id)
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .maybeSingle()

    if (mem) {
      return {
        allowed: true,
        customer,
        workspace: ws,
        workspaceRole: mem.workspace_role
      }
    }

    // Check if caller is Company Owner on the customer account (Company Owner Launch Mode)
    const { data: ownerMem } = await supabase
      .from('customer_company_memberships')
      .select('company_role')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .maybeSingle()

    if (ownerMem && ['owner', 'admin'].includes(ownerMem.company_role)) {
      return {
        allowed: true,
        customer,
        workspace: ws,
        workspaceRole: 'owner'
      }
    }
  }

  return {
    allowed: false,
    reason: `Access to product '${productSlug.toUpperCase()}' workspace is not granted for your account.`
  }
}

/**
 * Verify registered client application for OAuth SSO.
 */
export async function verifySsoClientApp(clientId: string, redirectUri: string) {
  const supabase = getSupabaseAdmin()

  // 1. Check Product Registry for SSO Eligibility
  const { data: prod } = await supabase
    .from('lam_products')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  if (prod && prod.identity_mode !== 'lam_sso') {
    return { valid: false, error: `Product '${prod.name}' does not participate in central LAM SSO.` }
  }

  const { data: app, error } = await supabase
    .from('sso_applications')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  if (error || !app) {
    // If registered in lam_products with identity_mode = 'lam_sso', construct dynamic client application context
    if (prod && prod.identity_mode === 'lam_sso') {
      const appUrl = prod.app_url || `https://${prod.slug}.lubbalmandumah.com`
      if (redirectUri.startsWith(appUrl) || redirectUri.includes(prod.slug)) {
        return {
          valid: true,
          app: {
            client_id: clientId,
            product_slug: prod.slug,
            app_name: prod.name,
            redirect_uris: [appUrl]
          }
        }
      }
    }
    return { valid: false, error: 'Unregistered client_id application.' }
  }

  // Check redirect URI match
  const uriMatch = app.redirect_uris.some((registeredUri: string) => {
    return redirectUri.startsWith(registeredUri) || registeredUri === redirectUri || redirectUri.includes(app.product_slug)
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
  nonce?: string,
  workspaceId?: string,
  workspaceCode?: string
): Promise<string> {
  const supabase = getSupabaseAdmin()
  const code = 'code_' + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minute code expiry

  const cleanScope = scope || 'openid profile email'

  const insertPayload: Record<string, any> = {
    code,
    client_id: clientId,
    customer_id: customerId,
    company_id: companyId || null,
    workspace_id: workspaceId || null,
    workspace_code: workspaceCode || null,
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
    // Handle fallback if optional workspace or nonce columns are pending schema cache reload
    delete insertPayload.workspace_id
    delete insertPayload.workspace_code
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
