import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getSessionUser } from '@/lib/session'
import { DISPLAY_HOSTNAME } from '@/lib/config'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { shortUrl, format = 'png', size = 300 } = body

    if (!shortUrl) {
      return NextResponse.json(
        { message: 'Short URL is required.' },
        { status: 400 },
      )
    }

    const fullUrl = `https://${DISPLAY_HOSTNAME}/${shortUrl}`

    if (format === 'svg') {
      const svg = await QRCode.toString(fullUrl, {
        type: 'svg',
        width: size,
        margin: 2,
      })
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      })
    }

    const buffer = await QRCode.toBuffer(fullUrl, {
      type: 'png',
      width: size,
      margin: 2,
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${shortUrl}-qr.png"`,
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { message: 'Error generating QR code.' },
      { status: 500 },
    )
  }
}
