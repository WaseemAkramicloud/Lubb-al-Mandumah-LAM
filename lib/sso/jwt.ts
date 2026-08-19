import crypto from 'crypto'

const ISSUER = process.env.LAM_SSO_ISSUER || process.env.NEXT_PUBLIC_APP_URL || 'https://id.lubbalmandumah.com'
const KEY_ID = 'lam-id-key-rs256-2026'

// RSA 2048 Keypair Manager (Private Key for signing, Public Key for verification & JWKS)
let privateKeyPem = process.env.LAM_SSO_PRIVATE_KEY
let rsaPrivateKeyObj: crypto.KeyObject | null = null
let rsaPublicKeyObj: crypto.KeyObject | null = null

if (privateKeyPem) {
  // Normalize unescaped \n characters if passed as single-line string in environment
  const normalizedPem = privateKeyPem.replace(/\\n/g, '\n').trim()
  try {
    rsaPrivateKeyObj = crypto.createPrivateKey(normalizedPem)
    rsaPublicKeyObj = crypto.createPublicKey(rsaPrivateKeyObj)
  } catch (err: any) {
    console.error('[LAM ID SSO KEY ERROR] Failed to parse LAM_SSO_PRIVATE_KEY:', err.message)
  }
}

// Development / Test Fallback: Generate transient RSA keypair if missing in non-production environment
if (!rsaPrivateKeyObj || !rsaPublicKeyObj) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[LAM ID SSO FATAL] Persistent LAM_SSO_PRIVATE_KEY environment variable is missing or invalid in production. SSO token signing refused.')
  } else {
    const keypair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    })
    rsaPrivateKeyObj = crypto.createPrivateKey(keypair.privateKey)
    rsaPublicKeyObj = crypto.createPublicKey(keypair.publicKey)
  }
}

export interface SsoTokenPayload {
  iss: string
  sub: string // immutable LAM Login Identity UUID
  aud: string // requesting client_id (e.g. lam_app_nexora)
  workspace_id?: string | null
  workspace_code?: string | null
  product?: string | null
  workspace_role?: string | null
  organization_id?: string | null
  email?: string | null
  given_name?: string | null
  family_name?: string | null
  scope?: string
  nonce?: string
  exp?: number
  iat?: number
  jti?: string
}

function base64UrlEncode(buffer: Buffer | string): string {
  const str = Buffer.isBuffer(buffer) ? buffer.toString('base64') : Buffer.from(buffer).toString('base64')
  return str
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
 * Sign an SSO JWT ID Token / Access Token using RS256 Asymmetric Private Key.
 */
export function signSsoJwt(
  payload: Omit<SsoTokenPayload, 'iss' | 'iat' | 'jti'>,
  expiresInSeconds: number = 3600
): string {
  if (!rsaPrivateKeyObj) {
    throw new Error('LAM ID SSO signing private key is missing or invalid. Token signing refused.')
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: KEY_ID
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

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signatureInput)
  const signature = signer.sign(rsaPrivateKeyObj, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${signatureInput}.${signature}`
}

/**
 * Verify and decode an SSO JWT token using Public Key (RS256).
 */
export function verifySsoJwt(token: string): { valid: boolean; payload?: SsoTokenPayload; error?: string } {
  try {
    if (!rsaPublicKeyObj) {
      return { valid: false, error: 'LAM ID public key is missing or invalid.' }
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' }
    }

    const [encodedHeader, encodedPayload, signature] = parts
    const signatureInput = `${encodedHeader}.${encodedPayload}`

    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(signatureInput)
    
    // Restore base64 format for signature verification
    let base64Sig = signature.replace(/-/g, '+').replace(/_/g, '/')
    while (base64Sig.length % 4) {
      base64Sig += '='
    }

    const isValidSig = verifier.verify(rsaPublicKeyObj, base64Sig, 'base64')
    if (!isValidSig) {
      return { valid: false, error: 'Invalid token signature (RS256 verification failed)' }
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
 * Generate a public JWKS object exposing public RSA keys only (No private or symmetric secrets).
 */
export function getJwksKeys() {
  if (!rsaPublicKeyObj) {
    throw new Error('LAM ID public key is missing or invalid.')
  }
  const jwk = rsaPublicKeyObj.export({ format: 'jwk' })
  return {
    keys: [
      {
        kty: 'RSA',
        alg: 'RS256',
        use: 'sig',
        kid: KEY_ID,
        n: jwk.n,
        e: jwk.e,
        issuer: ISSUER
      }
    ]
  }
}
