import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [userCount, urlCount, clickCount] = await Promise.all([
    prisma.user.count(),
    prisma.url.count(),
    prisma.urlClicks.aggregate({ _sum: { clicks: true } }),
  ])

  return NextResponse.json({
    userCount,
    linkCount: urlCount,
    clickCount: clickCount._sum.clicks || 0,
  })
}
