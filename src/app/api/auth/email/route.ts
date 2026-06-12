import { NextResponse } from 'next/server'
import { generateAndSendOtp, isValidEmailDomain } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { message: 'Please enter an email address.' },
        { status: 400 },
      )
    }

    if (!isValidEmailDomain(email)) {
      return NextResponse.json(
        { message: 'Invalid email domain.' },
        { status: 401 },
      )
    }

    await generateAndSendOtp(email)

    return NextResponse.json({ message: 'OTP sent to your email.' })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { message: 'Error sending OTP. Please try again.' },
      { status: 500 },
    )
  }
}
