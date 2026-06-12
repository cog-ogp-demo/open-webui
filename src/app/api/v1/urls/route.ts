import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { isValidShortUrl, isValidUrl, isBlacklisted } from '@/lib/validation'
import { DEV_ENV, OG_URL } from '@/lib/config'

const API_KEY_SALT = process.env.API_KEY_SALT || ''

async function authenticateApiKey(
  request: Request,
): Promise<{ userId: number } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const apiKey = authHeader.slice(7)
  if (!apiKey) return null

  try {
    const hash = await bcrypt.hash(apiKey, API_KEY_SALT)
    const user = await prisma.user.findFirst({
      where: { apiKeyHash: hash },
    })
    if (!user) return null
    return { userId: user.id }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request)
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { shortUrl, longUrl } = body

    if (!longUrl || !isValidUrl(longUrl, DEV_ENV)) {
      return NextResponse.json(
        { message: 'Invalid long URL.' },
        { status: 400 },
      )
    }

    if (isBlacklisted(longUrl)) {
      return NextResponse.json(
        { message: 'URL is not allowed.' },
        { status: 400 },
      )
    }

    if (shortUrl && !isValidShortUrl(shortUrl)) {
      return NextResponse.json(
        { message: 'Invalid short URL format.' },
        { status: 400 },
      )
    }

    const finalShortUrl = shortUrl || generateRandomShortUrl()

    const existing = await prisma.url.findUnique({
      where: { shortUrl: finalShortUrl },
    })
    if (existing) {
      return NextResponse.json(
        { message: 'Short URL already exists.' },
        { status: 409 },
      )
    }

    const url = await prisma.url.create({
      data: {
        shortUrl: finalShortUrl,
        longUrl,
        userId: auth.userId,
        source: 'API',
      },
    })

    await prisma.urlClicks.create({
      data: { shortUrl: url.shortUrl, clicks: 0 },
    })

    await prisma.urlHistory.create({
      data: {
        urlShortUrl: url.shortUrl,
        longUrl: url.longUrl,
        state: url.state,
        isFile: url.isFile,
        description: url.description,
        source: url.source,
        userId: auth.userId,
      },
    })

    return NextResponse.json(
      {
        shortUrl: url.shortUrl,
        longUrl: url.longUrl,
        state: url.state,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('API v1 error:', error)
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 },
    )
  }
}

function generateRandomShortUrl(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const length = Number(process.env.API_LINK_RANDOM_STR_LENGTH) || 8
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
