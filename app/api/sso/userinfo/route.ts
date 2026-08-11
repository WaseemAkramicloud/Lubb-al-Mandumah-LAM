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

  return NextResponse.json({
    sub: customer.id,
    email: customer.email,
    email_verified: true,
    first_name: customer.first_name,
    last_name: customer.last_name,
    company_id: payload.company_id,
    company_role: payload.company_role,
    granted_products: payload.products || []
  })
}
