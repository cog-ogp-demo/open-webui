import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()
    const otp = body.otp?.trim()

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required.' },
        { status: 400 },
      )
    }

    const isValid = await verifyOtp(email, otp)
    if (!isValid) {
      return NextResponse.json(
        { message: 'OTP is invalid or has expired.' },
        { status: 401 },
      )
    }

    return NextResponse.json({ message: 'OTP verified successfully.' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { message: 'Error verifying OTP. Please try again.' },
      { status: 500 },
    )
  }
}
