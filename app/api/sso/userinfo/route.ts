import { NextRequest, NextResponse } from 'next/server'
import { verifySsoJwt } from '@/lib/sso/jwt'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  return handleUserInfo(request)
}

export async function POST(request: NextRequest) {
  return handleUserInfo(request)
}

async function handleUserInfo(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized', error_description: 'Missing Bearer token' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const verification = verifySsoJwt(token)

  if (!verification.valid || !verification.payload) {
    return NextResponse.json({ error: 'invalid_token', error_description: verification.error }, { status: 401 })
  }

  const payload = verification.payload
  const supabase = getSupabaseAdmin()

  // Verify customer is still active
  const { data: customer } = await supabase
    .from('customer_identities')
    .select('id, email, first_name, last_name, status')
    .eq('id', payload.sub)
    .single()

  if (!customer || customer.status === 'suspended') {
    return NextResponse.json({ error: 'invalid_token', error_description: 'Customer account suspended or disabled' }, { status: 401 })
  }

  const cleanEmail = customer.email && !customer.email.endsWith('@users.lam.internal') ? customer.email : null

  return NextResponse.json({
    sub: customer.id,
    aud: payload.aud,
    workspace_id: payload.workspace_id || null,
    workspace_code: payload.workspace_code || null,
    product: payload.product || null,
    workspace_role: payload.workspace_role || 'member',
    email: cleanEmail,
    email_verified: !!cleanEmail,
    given_name: customer.first_name || 'User',
    family_name: customer.last_name || null
  })
}
