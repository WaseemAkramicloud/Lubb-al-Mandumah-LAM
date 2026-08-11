import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const INTERSERVICE_SECRET = process.env.LAM_INTERSERVICE_SECRET || 'lam-nexora-interservice-hmac-secret-key-2026-vault'

export interface InterServiceVerifyResult {
  valid: boolean
  error?: string
}

/**
 * Verify signed inter-service request from external products (e.g. NEXORA).
 */
export async function verifyInterServiceRequest(
  signature: string | null,
  timestampStr: string | null,
  nonce: string | null,
  bodyString: string
): Promise<InterServiceVerifyResult> {
  if (!signature || !timestampStr || !nonce) {
    return { valid: false, error: 'Missing inter-service authentication headers (X-LAM-Signature, X-LAM-Timestamp, X-LAM-Nonce).' }
  }

  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid timestamp header.' }
  }

  // 1. Replay window check (5 minutes / 300 seconds)
  const now = Math.floor(Date.now() / 1000)
  const timeDiff = Math.abs(now - timestamp)
  if (timeDiff > 300) {
    return { valid: false, error: 'Inter-service request expired or clock skew too large (> 300s).' }
  }

  // 2. Compute expected HMAC SHA-256 signature
  const signaturePayload = `${timestamp}.${nonce}.${bodyString}`
  const expectedSignature = crypto
    .createHmac('sha256', INTERSERVICE_SECRET)
    .update(signaturePayload)
    .digest('hex')

  if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
    return { valid: false, error: 'Invalid inter-service HMAC signature.' }
  }

  // 3. Database Nonce check to prevent replay attacks
  const supabase = getSupabaseAdmin()
  const { data: existingNonce } = await supabase
    .from('inter_service_nonces')
    .select('id')
    .eq('nonce', nonce)
    .maybeSingle()

  if (existingNonce) {
    return { valid: false, error: 'Replay attack detected: Nonce has already been processed.' }
  }

  // Record nonce
  await supabase.from('inter_service_nonces').insert({
    nonce,
    timestamp
  })

  return { valid: true }
}

/**
 * Sign an outbound inter-service payload for communicating to NEXORA.
 */
export function signInterServicePayload(bodyString: string): {
  signature: string
  timestamp: string
  nonce: string
} {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = 'nonce_' + crypto.randomUUID().replace(/-/g, '')
  const signaturePayload = `${timestamp}.${nonce}.${bodyString}`
  
  const signature = crypto
    .createHmac('sha256', INTERSERVICE_SECRET)
    .update(signaturePayload)
    .digest('hex')

  return { signature, timestamp, nonce }
}
