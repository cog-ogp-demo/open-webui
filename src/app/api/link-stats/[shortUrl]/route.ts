import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function GET(
  _request: Request,
  { params }: { params: { shortUrl: string } },
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { shortUrl } = params

  // Verify ownership
  const url = await prisma.url.findUnique({
    where: { shortUrl },
    select: { userId: true },
  })

  if (!url || url.userId !== user.id) {
    return NextResponse.json(
      { message: 'URL not found or unauthorized.' },
      { status: 404 },
    )
  }

  const [totalClicks, dailyClicks, weekdayClicks, deviceClicks] =
    await Promise.all([
      prisma.urlClicks.findUnique({
        where: { shortUrl },
        select: { clicks: true },
      }),
      prisma.dailyClicks.findMany({
        where: { shortUrl },
        orderBy: { date: 'asc' },
        select: { date: true, clicks: true },
      }),
      prisma.weekdayClicks.findMany({
        where: { shortUrl },
        orderBy: [{ weekday: 'asc' }, { hours: 'asc' }],
        select: { weekday: true, hours: true, clicks: true },
      }),
      prisma.devices.findUnique({
        where: { shortUrl },
        select: { mobile: true, tablet: true, desktop: true, others: true },
      }),
    ])

  return NextResponse.json({
    totalClicks: totalClicks?.clicks || 0,
    dailyClicks,
    weekdayClicks,
    deviceClicks: deviceClicks || {
      mobile: 0,
      tablet: 0,
      desktop: 0,
      others: 0,
    },
  })
}
