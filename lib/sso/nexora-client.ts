import { signInterServicePayload } from '@/lib/sso/inter-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const getNexoraProvisioningUrl = () => {
  if (process.env.NEXORA_PROVISIONING_URL) return process.env.NEXORA_PROVISIONING_URL
  if (process.env.NEXORA_BASE_URL) return `${process.env.NEXORA_BASE_URL}/api/inter-service/provisioning`
  return 'https://nexora-nu-lime-63.vercel.app/api/inter-service/provisioning'
}

const NEXORA_PROVISIONING_URL = getNexoraProvisioningUrl()

export interface NexoraProvisioningPayload {
  action: 'activate' | 'suspend' | 'update_entitlement'
  company_id: string
  company_name: string
  product_slug: string
  plan_tier: string
  max_seats: number
}

export interface NexoraProvisioningResponse {
  success: boolean
  instance_key?: string
  instance_url?: string
  error?: string
}

/**
 * Send an authenticated inter-service request from LAM TO NEXORA to activate/suspend/update a tenant instance.
 */
export async function notifyNexoraProvisioning(
  payload: NexoraProvisioningPayload
): Promise<NexoraProvisioningResponse> {
  try {
    const rawBody = JSON.stringify(payload)
    const { signature, timestamp, nonce } = signInterServicePayload(rawBody)

    // Call NEXORA's inter-service provisioning endpoint
    const response = await fetch(NEXORA_PROVISIONING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LAM-Signature': signature,
        'X-LAM-Timestamp': timestamp,
        'X-LAM-Nonce': nonce
      },
      body: rawBody
    })

    if (!response.ok) {
      const errText = await response.text()
      return { success: false, error: `NEXORA provisioning HTTP ${response.status}: ${errText}` }
    }

    const resData = await response.json()

    // If NEXORA returns tenant instance reference, register/update in customer_product_instances
    if (resData.success && resData.instance_key && resData.instance_url) {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('customer_product_instances')
        .upsert(
          {
            company_id: payload.company_id,
            product_slug: payload.product_slug,
            instance_key: resData.instance_key,
            instance_url: resData.instance_url,
            status: payload.action === 'suspend' ? 'suspended' : 'active',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'company_id,product_slug,instance_key' }
        )
    }

    return {
      success: true,
      instance_key: resData.instance_key,
      instance_url: resData.instance_url
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to NEXORA provisioning endpoint' }
  }
}
