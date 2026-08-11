import { NextResponse } from 'next/server'
import { verifyInterServiceRequest } from '@/lib/sso/inter-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

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
    const { action, customer_id, email, notes } = payload

    const supabase = getSupabaseAdmin()

    let targetCustomerId = customer_id
    if (!targetCustomerId && email) {
      const { data: customer } = await supabase
        .from('customer_identities')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (customer) {
        targetCustomerId = customer.id
      }
    }

    if (!targetCustomerId) {
      return NextResponse.json({ error: 'Customer identity not found.' }, { status: 404 })
    }

    if (action === 'check') {
      const { data: adminGrant } = await supabase
        .from('nexora_platform_admins')
        .select('id, status, created_at')
        .eq('customer_id', targetCustomerId)
        .eq('status', 'active')
        .maybeSingle()

      return NextResponse.json({
        is_nexora_platform_admin: !!adminGrant,
        admin_grant: adminGrant || null
      })
    } else if (action === 'grant') {
      const { data: adminGrant, error } = await supabase
        .from('nexora_platform_admins')
        .upsert({
          customer_id: targetCustomerId,
          status: 'active',
          notes: notes || 'Granted via inter-service API',
          updated_at: new Date().toISOString()
        }, { onConflict: 'customer_id' })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, is_nexora_platform_admin: true, admin_grant: adminGrant })
    } else if (action === 'revoke') {
      const { data: adminGrant, error } = await supabase
        .from('nexora_platform_admins')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('customer_id', targetCustomerId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, is_nexora_platform_admin: false, admin_grant: adminGrant })
    }

    return NextResponse.json({ error: `Invalid action '${action}'. Use 'check', 'grant', or 'revoke'.` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
