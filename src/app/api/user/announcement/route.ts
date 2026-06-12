import { NextResponse } from 'next/server'
import { USER_ANNOUNCEMENT } from '@/lib/config'

export async function GET() {
  if (!USER_ANNOUNCEMENT.message) {
    return NextResponse.json(null)
  }
  return NextResponse.json(USER_ANNOUNCEMENT)
}
