import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { verifySsoClientApp, validateCustomerProductAccess, createAuthorizationCode, logCustomerAudit } from '@/lib/sso/sso-service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const productSlug = searchParams.get('product') || searchParams.get('scope')?.split(' ').find(s => s.startsWith('product:'))?.replace('product:', '') || ''
  const requestedWorkspaceCode = searchParams.get('workspace') || searchParams.get('workspace_code') || ''
  const responseType = searchParams.get('response_type') || 'code'
  const state = searchParams.get('state') || ''
  const codeChallenge = searchParams.get('code_challenge') || ''
  const codeChallengeMethod = searchParams.get('code_challenge_method') || ''
  const nonce = searchParams.get('nonce') || ''

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'invalid_request', error_description: 'Missing client_id or redirect_uri' }, { status: 400 })
  }

  // Enforce PKCE S256 requirement for production clients
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction && codeChallengeMethod.toLowerCase() === 'plain') {
    return NextResponse.json({
      error: 'invalid_request',
      error_description: 'Production OAuth requests require code_challenge_method=S256. Plain PKCE is not permitted.'
    }, { status: 400 })
  }

  // 1. Verify Client Application & Product Identity Mode
  const appCheck = await verifySsoClientApp(clientId, redirectUri)
  if (!appCheck.valid) {
    return NextResponse.json({ error: 'invalid_client', error_description: appCheck.error }, { status: 400 })
  }

  const targetProduct = productSlug || appCheck.app.product_slug || 'nexora'

  // REQUESTING PRODUCT ISOLATION: Verify client_id matches target product
  if (appCheck.app.product_slug && appCheck.app.product_slug !== targetProduct) {
    return NextResponse.json({
      error: 'invalid_grant',
      error_description: `Client ID '${clientId}' belongs to ${appCheck.app.product_slug.toUpperCase()}, which cannot authorize requests for ${targetProduct.toUpperCase()}.`
    }, { status: 400 })
  }

  // 2. Check Customer Authentication Session
  const customer = await getCurrentCustomer()
  if (!customer) {
    // Redirect to central LAM ID Login page with return URL
    const loginUrl = new URL('/id/login', request.url)
    loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname + request.nextUrl.search)
    loginUrl.searchParams.set('product', targetProduct)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Multi-Layered Product & Workspace Access Verification
  const accessCheck = await validateCustomerProductAccess(customer.id, targetProduct, requestedWorkspaceCode)

  if (!accessCheck.allowed) {
    await logCustomerAudit(customer.id, null, 'sso_access_denied', {
      client_id: clientId,
      product: targetProduct,
      workspaceCode: requestedWorkspaceCode,
      reason: accessCheck.reason
    })

    const deniedUrl = new URL('/id/login', request.url)
    deniedUrl.searchParams.set('error', 'access_denied')
    deniedUrl.searchParams.set('error_description', accessCheck.reason || 'Access denied to this product workspace.')
    return NextResponse.redirect(deniedUrl)
  }

  const workspace = accessCheck.workspace

  // 4. Generate Short-Lived Authorization Code with Workspace Context
  const code = await createAuthorizationCode(
    clientId,
    customer.id,
    redirectUri,
    workspace?.customer_account_id || accessCheck.company?.id,
    'openid profile email',
    codeChallenge,
    codeChallengeMethod,
    nonce,
    workspace?.id,
    workspace?.workspace_code
  )

  await logCustomerAudit(customer.id, workspace?.customer_account_id, 'sso_authorize_granted', {
    client_id: clientId,
    product: targetProduct,
    workspaceCode: workspace?.workspace_code
  })

  // 5. Redirect back to Child SaaS application callback URL
  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set('code', code)
  if (state) callbackUrl.searchParams.set('state', state)

  return NextResponse.redirect(callbackUrl)
}
