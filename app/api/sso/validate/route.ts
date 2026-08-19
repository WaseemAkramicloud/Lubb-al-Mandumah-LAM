import { NextRequest, NextResponse } from 'next/server'
import { verifySsoJwt } from '@/lib/sso/jwt'
import { validateCustomerProductAccess } from '@/lib/sso/sso-service'

export async function POST(request: NextRequest) {
  try {
    const { token, target_product, workspace_code } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Missing token' }, { status: 400 })
    }

    const verification = verifySsoJwt(token)
    if (!verification.valid || !verification.payload) {
      return NextResponse.json({ valid: false, error: verification.error }, { status: 401 })
    }

    const payload = verification.payload
    const prod = target_product || payload.product || 'nexora'

    // If a target_product or workspace_code is specified, check access grant again
    if (prod) {
      const access = await validateCustomerProductAccess(payload.sub, prod, workspace_code || payload.workspace_code || undefined)
      if (!access.allowed) {
        return NextResponse.json({
          valid: false,
          error: access.reason || 'Product workspace access revoked',
          sub: payload.sub
        }, { status: 403 })
      }
    }

    return NextResponse.json({
      valid: true,
      sub: payload.sub,
      aud: payload.aud,
      workspace_id: payload.workspace_id || null,
      workspace_code: payload.workspace_code || null,
      product: payload.product || prod,
      workspace_role: payload.workspace_role || 'member',
      email: payload.email || null,
      given_name: payload.given_name || 'User',
      family_name: payload.family_name || null
    })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 })
  }
}
