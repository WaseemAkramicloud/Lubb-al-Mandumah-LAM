import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname, search } = url
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0]

  // Allow static files, internal Next.js assets, and favicon to bypass hostname rewriting
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') || // preserve API route handling
    pathname.startsWith('/.well-known/') || // preserve OIDC metadata & JWKS
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return await updateSession(request)
  }

  // Local development bypass
  if (
    host.includes('localhost') ||
    host.includes('127.0.0.1')
  ) {
    return await updateSession(request)
  }

  // 0. Vercel Alias Domain: Enforce canonical production subdomains
  if (host.endsWith('.vercel.app')) {
    if (pathname.startsWith('/id/') || pathname === '/id') {
      return NextResponse.redirect(`https://id.lubbalmandumah.com${pathname}${search}`, 307)
    }
    if (pathname.startsWith('/control-panel') || pathname.startsWith('/staff-login')) {
      return NextResponse.redirect(`https://staff.lubbalmandumah.com${pathname}${search}`, 307)
    }
    if (pathname.startsWith('/portal')) {
      return NextResponse.redirect(`https://access.lubbalmandumah.com${pathname}${search}`, 307)
    }
  }

  // 1. Apex Domain Redirect: lubbalmandumah.com -> www.lubbalmandumah.com
  if (host === 'lubbalmandumah.com') {
    return NextResponse.redirect(`https://www.lubbalmandumah.com${pathname}${search}`, 301)
  }

  // 2. Staff Control Panel: staff.lubbalmandumah.com
  if (host === 'staff.lubbalmandumah.com') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/staff-login', request.url))
    }
    // Protect staff subdomain from rendering public marketing pages
    if (
      !pathname.startsWith('/staff-login') &&
      !pathname.startsWith('/control-panel') &&
      !pathname.startsWith('/force-change-password')
    ) {
      return NextResponse.redirect(new URL('/staff-login', request.url))
    }
    return await updateSession(request)
  }

  // 3. LAM ID Authority: id.lubbalmandumah.com
  if (host === 'id.lubbalmandumah.com') {
    if (pathname === '/' || pathname === '/id') {
      return NextResponse.redirect(new URL('/id/login', request.url))
    }
    if (!pathname.startsWith('/id')) {
      return NextResponse.redirect(new URL(`/id${pathname}`, request.url))
    }
    return await updateSession(request)
  }

  // 4. Customer Account Portal / Owner Console: access.lubbalmandumah.com & account.lubbalmandumah.com
  if (host === 'account.lubbalmandumah.com' || host === 'access.lubbalmandumah.com') {
    // Redirect /id/* requests across hosts to canonical Identity Authority host
    if (pathname.startsWith('/id/') || pathname === '/id') {
      return NextResponse.redirect(`https://id.lubbalmandumah.com${pathname}${search}`, 307)
    }
    // Redirect staff routes across hosts to staff subdomain
    if (pathname.startsWith('/control-panel') || pathname.startsWith('/staff-login')) {
      return NextResponse.redirect(`https://staff.lubbalmandumah.com${pathname}${search}`, 307)
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
    if (!pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
    return await updateSession(request)
  }

  // 5. Public Website: www.lubbalmandumah.com
  if (host === 'www.lubbalmandumah.com') {
    // Redirect internal staff/customer routes to their canonical subdomains
    if (pathname.startsWith('/control-panel') || pathname.startsWith('/staff-login')) {
      return NextResponse.redirect(`https://staff.lubbalmandumah.com${pathname}${search}`, 301)
    }
    if (pathname.startsWith('/id/')) {
      return NextResponse.redirect(`https://id.lubbalmandumah.com${pathname}${search}`, 301)
    }
    if (pathname.startsWith('/portal')) {
      return NextResponse.redirect(`https://access.lubbalmandumah.com${pathname}${search}`, 301)
    }
    return await updateSession(request)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
