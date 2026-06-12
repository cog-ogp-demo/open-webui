import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function GET(
  request: Request,
  { params }: { params: { shortUrl: string } },
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { shortUrl } = params
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit')) || 10
  const offset = Number(searchParams.get('offset')) || 0

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

  const [history, count] = await Promise.all([
    prisma.urlHistory.findMany({
      where: { urlShortUrl: shortUrl },
      include: {
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.urlHistory.count({
      where: { urlShortUrl: shortUrl },
    }),
  ])

  return NextResponse.json({ history, count })
}
