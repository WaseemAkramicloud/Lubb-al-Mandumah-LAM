import { customerLogout } from '@/lib/actions/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return handleSignout(request)
}

export async function POST(request: NextRequest) {
  return handleSignout(request)
}

async function handleSignout(request: NextRequest) {
  await customerLogout()

  const searchParams = request.nextUrl.searchParams
  const postLogoutUri = searchParams.get('post_logout_redirect_uri') || searchParams.get('redirect_uri') || ''

  let targetRedirectUrl = 'https://id.lubbalmandumah.com/id/login'

  if (postLogoutUri) {
    const supabase = getSupabaseAdmin()
    const { data: ssoProds } = await supabase.from('lam_products').select('app_url')
    const registeredUrls = (ssoProds || []).map(p => p.app_url).filter(Boolean)

    const isValidRedirect = registeredUrls.some(url => postLogoutUri.startsWith(url)) || postLogoutUri.includes('lubbalmandumah.com')
    if (isValidRedirect) {
      targetRedirectUrl = postLogoutUri
    }
  }

  return NextResponse.redirect(targetRedirectUrl)
}
