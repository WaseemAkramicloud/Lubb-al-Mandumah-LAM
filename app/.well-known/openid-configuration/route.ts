import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'lam.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = process.env.LAM_SSO_ISSUER || process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

  const config = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/sso/authorize`,
    token_endpoint: `${baseUrl}/api/sso/token`,
    userinfo_endpoint: `${baseUrl}/api/sso/userinfo`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    claims_supported: [
      'sub',
      'iss',
      'aud',
      'exp',
      'iat',
      'email',
      'given_name',
      'family_name',
      'company_id',
      'company_role',
      'products',
      'is_nexora_platform_admin'
    ]
  }

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json'
    }
  })
}
