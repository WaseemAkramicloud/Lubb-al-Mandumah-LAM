import crypto from 'crypto'

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'lam-sso-default-jwt-secret-2026-key'
const ISSUER = 'https://lam.com'

export interface SsoTokenPayload {
  iss: string
  sub: string // customer_id
  aud: string // client_id
  email: string
  first_name: string
  last_name?: string | null
  company_id?: string | null
  company_role?: string | null
  products: string[] // Array of explicitly granted product slugs
  scope?: string
  exp: number
  iat: number
  jti: string
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf8')
}

/**
 * Sign an SSO JWT token for a given customer & client application.
 */
export function signSsoJwt(payload: Omit<SsoTokenPayload, 'iss' | 'iat' | 'jti'>, expiresInSeconds: number = 3600): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: 'lam-id-key-1'
  }

  const now = Math.floor(Date.now() / 1000)
  const fullPayload: SsoTokenPayload = {
    ...payload,
    iss: ISSUER,
    iat: now,
    exp: payload.exp || (now + expiresInSeconds),
    jti: crypto.randomUUID()
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${signatureInput}.${signature}`
}

/**
 * Verify and decode an SSO JWT token.
 */
export function verifySsoJwt(token: string): { valid: boolean; payload?: SsoTokenPayload; error?: string } {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' }
    }

    const [encodedHeader, encodedPayload, signature] = parts
    const signatureInput = `${encodedHeader}.${encodedPayload}`

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' }
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SsoTokenPayload

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' }
    }

    if (payload.iss !== ISSUER) {
      return { valid: false, error: 'Invalid issuer' }
    }

    return { valid: true, payload }
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' }
  }
}

/**
 * Generate a public JWKS object for external SaaS token verification.
 */
export function getJwksKeys() {
  return {
    keys: [
      {
        kty: 'oct',
        alg: 'HS256',
        use: 'sig',
        kid: 'lam-id-key-1',
        issuer: ISSUER
      }
    ]
  }
}
