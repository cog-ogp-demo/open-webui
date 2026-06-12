import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const limit = Number(searchParams.get('limit')) || 10
  const offset = Number(searchParams.get('offset')) || 0
  const orderBy = searchParams.get('orderBy') || 'createdAt'
  const sortDirection = searchParams.get('sortDirection') || 'desc'
  const state = searchParams.get('state') || 'ACTIVE'
  const isFile = searchParams.get('isFile')
  const isEmail = searchParams.get('isEmail') === 'true'

  const where: Record<string, unknown> = {
    state,
  }

  if (isFile !== null && isFile !== undefined && isFile !== '') {
    where.isFile = isFile === 'true'
  }

  if (query) {
    if (isEmail) {
      where.user = { email: { contains: query, mode: 'insensitive' } }
    } else {
      where.OR = [
        { shortUrl: { contains: query, mode: 'insensitive' } },
        { longUrl: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }
  }

  const [urls, count] = await Promise.all([
    prisma.url.findMany({
      where,
      include: {
        user: { select: { email: true } },
        urlClicks: { select: { clicks: true } },
      },
      orderBy: { [orderBy]: sortDirection },
      skip: offset,
      take: limit,
    }),
    prisma.url.count({ where }),
  ])

  const formatted = urls.map((url) => ({
    shortUrl: url.shortUrl,
    longUrl: url.longUrl,
    state: url.state,
    isFile: url.isFile,
    description: url.description,
    contactEmail: url.contactEmail,
    email: url.user?.email || '',
    clicks: url.urlClicks?.clicks || 0,
    createdAt: url.createdAt,
  }))

  return NextResponse.json({ urls: formatted, count })
}
