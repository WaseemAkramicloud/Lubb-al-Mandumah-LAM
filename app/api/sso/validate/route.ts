import { NextRequest, NextResponse } from 'next/server'
import { verifySsoJwt } from '@/lib/sso/jwt'
import { validateCustomerProductAccess } from '@/lib/sso/sso-service'

export async function POST(request: NextRequest) {
  try {
    const { token, target_product } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Missing token' }, { status: 400 })
    }

    const verification = verifySsoJwt(token)
    if (!verification.valid || !verification.payload) {
      return NextResponse.json({ valid: false, error: verification.error }, { status: 401 })
    }

    const payload = verification.payload

    // If a target_product is specified, check explicit access grant again
    if (target_product) {
      const access = await validateCustomerProductAccess(payload.sub, target_product)
      if (!access.allowed) {
        return NextResponse.json({
          valid: false,
          error: access.reason || 'Product access revoked',
          sub: payload.sub
        }, { status: 403 })
      }
    }

    return NextResponse.json({
      valid: true,
      sub: payload.sub,
      email: payload.email,
      given_name: payload.given_name,
      family_name: payload.family_name,
      company_id: payload.company_id,
      company_role: payload.company_role,
      is_nexora_platform_admin: !!payload.is_nexora_platform_admin,
      granted_products: payload.products || []
    })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 })
  }
}
