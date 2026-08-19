import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'id.lubbalmandumah.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = process.env.LAM_SSO_ISSUER || `${protocol}://${host}`

  const config = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/sso/authorize`,
    token_endpoint: `${baseUrl}/api/sso/token`,
    userinfo_endpoint: `${baseUrl}/api/sso/userinfo`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    end_session_endpoint: `${baseUrl}/api/auth/customer-signout`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
    claims_supported: [
      'sub',
      'iss',
      'aud',
      'workspace_id',
      'workspace_code',
      'product',
      'workspace_role',
      'organization_id',
      'email',
      'given_name',
      'family_name',
      'nonce',
      'exp',
      'iat',
      'jti'
    ]
  }

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json'
    }
  })
}
