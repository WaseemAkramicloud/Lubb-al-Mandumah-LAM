import { NextResponse } from 'next/server'
import { verifyInterServiceRequest } from '@/lib/sso/inter-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

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
    const { company_id, email, role, product_slugs } = payload

    if (!company_id || !email) {
      return NextResponse.json({ error: 'Missing required parameters: company_id, email.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Check if customer identity already exists
    const { data: existingCustomer } = await supabase
      .from('customer_identities')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    // 2. Generate invitation token
    const token = 'inv_' + crypto.randomUUID().replace(/-/g, '')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    const { data: invitation, error: invError } = await supabase
      .from('customer_invitations')
      .insert({
        token,
        company_id,
        email: email.trim().toLowerCase(),
        role: role || 'member',
        product_slugs: product_slugs || ['nexora'],
        expires_at: expiresAt,
        status: 'pending'
      })
      .select()
      .single()

    if (invError) {
      return NextResponse.json({ error: `Invitation creation failed: ${invError.message}` }, { status: 500 })
    }

    const host = request.headers.get('host') || 'lam.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const inviteUrl = `${protocol}://${host}/id/invite/${token}`

    return NextResponse.json({
      success: true,
      existing_customer: !!existingCustomer,
      invitation_id: invitation.id,
      token,
      invite_url: inviteUrl
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal invitation error' }, { status: 500 })
  }
}
