import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    expression: process.env.VALID_EMAIL_GLOB_EXPRESSION || '*.gov.sg',
  })
}
