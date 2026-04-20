import { NextRequest, NextResponse } from 'next/server'
import { detectGeo } from '@/lib/geo'

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  const geo = await detectGeo(ip)
  return NextResponse.json(geo)
}
