import { NextResponse } from 'next/server'
import { verifyInterServiceRequest } from '@/lib/sso/inter-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logCustomerAudit } from '@/lib/sso/sso-service'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-lam-signature')
    const timestamp = request.headers.get('x-lam-timestamp')
    const nonce = request.headers.get('x-lam-nonce')

    const verification = await verifyInterServiceRequest(signature, timestamp, nonce, rawBody)
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const { action, company_id, product_slug, plan_tier, max_seats, instance_key, instance_url } = payload

    if (!company_id || !product_slug || !action) {
      return NextResponse.json({ error: 'Missing required parameters: company_id, product_slug, action.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    if (action === 'activate' || action === 'update_entitlement') {
      // 1. Upsert entitlement
      const { data: entitlement, error: entError } = await supabase
        .from('customer_product_entitlements')
        .upsert(
          {
            company_id,
            product_slug,
            plan_tier: plan_tier || 'standard',
            max_seats: max_seats || 10,
            status: 'active',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'company_id,product_slug' }
        )
        .select()
        .single()

      if (entError) {
        return NextResponse.json({ error: `Entitlement upsert failed: ${entError.message}` }, { status: 500 })
      }

      // 2. Register/update tenant instance if provided
      let instanceData = null
      if (instance_key && instance_url) {
        const { data: instance, error: instError } = await supabase
          .from('customer_product_instances')
          .upsert(
            {
              company_id,
              product_slug,
              instance_key,
              instance_url,
              status: 'active',
              updated_at: new Date().toISOString()
            },
            { onConflict: 'company_id,product_slug,instance_key' }
          )
          .select()
          .single()

        if (!instError) {
          instanceData = instance
        }
      }

      await logCustomerAudit(null, company_id, `PROVISIONING_${action.toUpperCase()}`, {
        product_slug,
        plan_tier,
        max_seats,
        instance_key
      })

      return NextResponse.json({
        success: true,
        action,
        entitlement,
        instance: instanceData
      })
    } else if (action === 'suspend') {
      // Update entitlement status to suspended
      const { data: entitlement, error: entError } = await supabase
        .from('customer_product_entitlements')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('company_id', company_id)
        .eq('product_slug', product_slug)
        .select()
        .single()

      if (entError) {
        return NextResponse.json({ error: `Entitlement suspension failed: ${entError.message}` }, { status: 500 })
      }

      await logCustomerAudit(null, company_id, 'PROVISIONING_SUSPEND', { product_slug })

      return NextResponse.json({ success: true, action: 'suspend', entitlement })
    }

    return NextResponse.json({ error: `Unsupported provisioning action '${action}'.` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal provisioning error' }, { status: 500 })
  }
}
