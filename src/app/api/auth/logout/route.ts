import { NextResponse } from 'next/server'

export async function GET() {
  // NextAuth handles session invalidation via /api/auth/signout
  // This endpoint is kept for backward compatibility
  return NextResponse.json({ message: 'Logged out' })
}
