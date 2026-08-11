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

    // 2. Fetch Granted Products for Customer in this Company
    let grantedProducts: string[] = []
    let companyRole = 'member'

    if (authCode.company_id) {
      const { data: accessRows } = await supabase
        .from('customer_product_access')
        .select('product_slug')
        .eq('customer_id', customer.id)
        .eq('company_id', authCode.company_id)
        .eq('status', 'active')

      grantedProducts = (accessRows || []).map(r => r.product_slug)

      const { data: mem } = await supabase
        .from('customer_company_memberships')
        .select('company_role')
        .eq('customer_id', customer.id)
        .eq('company_id', authCode.company_id)
        .maybeSingle()

      if (mem) companyRole = mem.company_role
    }

    // 3. Check if user is a NEXORA platform administrator
    const { data: adminGrant } = await supabase
      .from('nexora_platform_admins')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('status', 'active')
      .maybeSingle()

    // 4. Issue Signed OIDC JWT ID Token & Access Token
    const tokenPayload = {
      sub: customer.id,
      aud: client_id,
      email: customer.email,
      given_name: customer.first_name,
      family_name: customer.last_name,
      company_id: authCode.company_id,
      company_role: companyRole,
      products: grantedProducts,
      is_nexora_platform_admin: !!adminGrant,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour token
    }

    const idToken = signSsoJwt(tokenPayload, 3600)
    const accessToken = signSsoJwt({ ...tokenPayload, scope: 'access_token' }, 3600)

    await logCustomerAudit(customer.id, authCode.company_id, 'sso_token_issued', { client_id })

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
