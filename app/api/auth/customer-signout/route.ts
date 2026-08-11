import { customerLogout } from '@/lib/actions/customer-auth'
import { NextResponse } from 'next/server'

export async function POST() {
  await customerLogout()
  return NextResponse.redirect(new URL('/id/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
