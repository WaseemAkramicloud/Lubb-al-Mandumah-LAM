import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { signSsoJwt } from '@/lib/sso/jwt'
import { logCustomerAudit } from '@/lib/sso/sso-service'

export async function POST(request: NextRequest) {
  try {
    let body: any
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      body = await request.json()
    }

    const { code, client_id, client_secret, redirect_uri, grant_type } = body

    if (grant_type !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 })
    }

    if (!code || !client_id) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Missing code or client_id' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Fetch & Verify Authorization Code
    const { data: authCode, error: codeErr } = await supabase
      .from('sso_auth_codes')
      .select('*, customer:customer_identities(*)')
      .eq('code', code)
      .eq('client_id', client_id)
      .eq('used', false)
      .single()

    if (codeErr || !authCode) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' }, { status: 400 })
    }

    // Check expiry
    if (new Date(authCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Authorization code expired' }, { status: 400 })
    }

    // Mark code as used (single-use token guarantee)
    await supabase
      .from('sso_auth_codes')
      .update({ used: true })
      .eq('id', authCode.id)

    const customer = authCode.customer as any
    if (!customer || customer.status === 'suspended') {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Customer account suspended or unavailable' }, { status: 400 })
    }

    // 2. Resolve Product Registry Info & Requesting Product Isolation
    const { data: prod } = await supabase
      .from('lam_products')
      .select('*')
      .eq('client_id', client_id)
      .maybeSingle()

    if (prod && prod.identity_mode !== 'lam_sso') {
      return NextResponse.json({ error: 'invalid_client', error_description: `Product '${prod.name}' does not participate in central LAM SSO.` }, { status: 400 })
    }

    const productSlug = prod?.slug || 'nexora'

    // 3. Resolve Workspace Role Context
    let workspaceRole = 'member'
    let workspaceId = authCode.workspace_id
    let workspaceCode = authCode.workspace_code
    let organizationId: string | null = null

    if (workspaceId) {
      const { data: ws } = await supabase
        .from('lam_product_workspaces')
        .select('id, workspace_code, product_slug, organization_id')
        .eq('id', workspaceId)
        .single()

      if (ws) {
        organizationId = ws.organization_id
        if (ws.product_slug !== productSlug) {
          return NextResponse.json({
            error: 'invalid_grant',
            error_description: `Workspace Code '${workspaceCode}' belongs to ${ws.product_slug.toUpperCase()}, which cannot be authorized for ${productSlug.toUpperCase()}.`
          }, { status: 400 })
        }

        const { data: mem } = await supabase
          .from('lam_workspace_memberships')
          .select('workspace_role, status')
          .eq('workspace_id', ws.id)
          .eq('customer_id', customer.id)
          .maybeSingle()

        if (mem && mem.status === 'active') {
          workspaceRole = mem.workspace_role
        } else {
          // Check if Company Owner
          const { data: ownerMem } = await supabase
            .from('customer_company_memberships')
            .select('company_role')
            .eq('customer_id', customer.id)
            .eq('status', 'active')
            .maybeSingle()

          if (ownerMem && ['owner', 'admin'].includes(ownerMem.company_role)) {
            workspaceRole = 'owner'
          }
        }
      }
    }

    // Extract nonce
    let nonceVal: string | undefined = (authCode as any).nonce
    if (!nonceVal && authCode.code_challenge && authCode.code_challenge.includes(';nonce=')) {
      const parts = authCode.code_challenge.split(';nonce=')
      nonceVal = parts[1]
    }

    // 4. Issue Minimal, Workspace-Scoped OIDC JWT ID Token & Access Token
    const tokenPayload = {
      sub: customer.id, // immutable LAM Login Identity UUID
      aud: client_id, // requesting client_id
      workspace_id: workspaceId || null,
      workspace_code: workspaceCode || null,
      product: productSlug,
      workspace_role: workspaceRole,
      organization_id: organizationId || null,
      email: customer.email && !customer.email.endsWith('@users.lam.internal') ? customer.email : null,
      given_name: customer.first_name || 'User',
      family_name: customer.last_name || null,
      nonce: nonceVal || undefined,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour token
    }

    const idToken = signSsoJwt(tokenPayload, 3600)
    const accessToken = signSsoJwt({ ...tokenPayload, scope: 'access_token' }, 3600)

    await logCustomerAudit(customer.id, authCode.company_id, 'sso_token_issued', {
      client_id,
      product: productSlug,
      workspaceCode
    })

    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
      scope: 'openid profile email'
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'server_error', error_description: err.message }, { status: 500 })
  }
}
