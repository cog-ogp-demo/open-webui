import { NextResponse } from 'next/server'
import { USER_MESSAGE } from '@/lib/config'

export async function GET() {
  return new NextResponse(USER_MESSAGE || '', {
    headers: { 'Content-Type': 'text/plain' },
  })
}
