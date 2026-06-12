import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rotatedLinksStr = process.env.ROTATED_LINKS || ''
  const shortUrls = rotatedLinksStr.split(',').filter(Boolean)

  if (shortUrls.length === 0) {
    return NextResponse.json({ urls: [] })
  }

  const urls = await prisma.url.findMany({
    where: {
      shortUrl: { in: shortUrls },
      state: 'ACTIVE',
    },
    select: {
      shortUrl: true,
      longUrl: true,
    },
  })

  return NextResponse.json({ urls })
}
