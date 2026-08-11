import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { verifySsoClientApp, validateCustomerProductAccess, createAuthorizationCode, logCustomerAudit } from '@/lib/sso/sso-service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const productSlug = searchParams.get('product') || searchParams.get('scope')?.split(' ').find(s => s.startsWith('product:'))?.replace('product:', '') || ''
  const responseType = searchParams.get('response_type') || 'code'
  const state = searchParams.get('state') || ''
  const codeChallenge = searchParams.get('code_challenge') || ''
  const codeChallengeMethod = searchParams.get('code_challenge_method') || ''

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'invalid_request', error_description: 'Missing client_id or redirect_uri' }, { status: 400 })
  }

  // 1. Verify Client Application
  const appCheck = await verifySsoClientApp(clientId, redirectUri)
  if (!appCheck.valid) {
    return NextResponse.json({ error: 'invalid_client', error_description: appCheck.error }, { status: 400 })
  }

  const targetProduct = productSlug || appCheck.app.product_slug || 'nexora'

  // 2. Check Customer Authentication Session
  const customer = await getCurrentCustomer()
  if (!customer) {
    // Redirect to central LAM ID Login page with return URL
    const loginUrl = new URL('/id/login', request.url)
    loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Multi-Layered Product Access Verification (LAM ID decides WHETHER user may enter)
  const accessCheck = await validateCustomerProductAccess(customer.id, targetProduct)

  if (!accessCheck.allowed) {
    await logCustomerAudit(customer.id, null, 'sso_access_denied', {
      client_id: clientId,
      product: targetProduct,
      reason: accessCheck.reason
    })

    // Redirect to LAM ID Login with access denied message
    const deniedUrl = new URL('/id/login', request.url)
    deniedUrl.searchParams.set('error', 'access_denied')
    deniedUrl.searchParams.set('error_description', accessCheck.reason || 'Access denied to this product.')
    return NextResponse.redirect(deniedUrl)
  }

  // 4. Generate Short-Lived Authorization Code
  const code = await createAuthorizationCode(
    clientId,
    customer.id,
    redirectUri,
    accessCheck.company?.id,
    'openid profile email',
    codeChallenge,
    codeChallengeMethod
  )

  await logCustomerAudit(customer.id, accessCheck.company?.id, 'sso_authorize_granted', {
    client_id: clientId,
    product: targetProduct
  })

  // 5. Redirect back to Child SaaS application callback URL
  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set('code', code)
  if (state) callbackUrl.searchParams.set('state', state)

  return NextResponse.redirect(callbackUrl)
}
