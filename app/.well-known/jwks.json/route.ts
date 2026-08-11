import { NextResponse } from 'next/server'
import { getJwksKeys } from '@/lib/sso/jwt'

export async function GET() {
  return NextResponse.json(getJwksKeys(), {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json'
    }
  })
}
