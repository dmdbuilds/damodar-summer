import { NextResponse } from 'next/server'
import { getCerts } from '@/lib/notion'

export const revalidate = 3600

export async function GET() {
  try {
    const certs = await getCerts()
    return NextResponse.json(certs)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
