import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import {
  isValidShortUrl,
  isValidUrl,
  isBlacklisted,
  isCircularRedirects,
} from '@/lib/validation'
import { OG_URL, DEV_ENV } from '@/lib/config'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit')) || 10
  const offset = Number(searchParams.get('offset')) || 0
  const searchText = searchParams.get('searchText') || ''
  const orderBy = searchParams.get('orderBy') || 'createdAt'
  const sortDirection = searchParams.get('sortDirection') || 'desc'
  const state = searchParams.get('state') || undefined
  const isFile = searchParams.get('isFile')

  const where: Record<string, unknown> = { userId: user.id }

  if (state) {
    where.state = state
  }

  if (isFile !== null && isFile !== undefined && isFile !== '') {
    where.isFile = isFile === 'true'
  }

  if (searchText) {
    where.OR = [
      { shortUrl: { contains: searchText, mode: 'insensitive' } },
      { longUrl: { contains: searchText, mode: 'insensitive' } },
      { description: { contains: searchText, mode: 'insensitive' } },
    ]
  }

  const [urls, count] = await Promise.all([
    prisma.url.findMany({
      where,
      include: {
        urlClicks: { select: { clicks: true } },
        tags: { select: { tagString: true } },
      },
      orderBy: { [orderBy]: sortDirection },
      skip: offset,
      take: limit,
    }),
    prisma.url.count({ where }),
  ])

  const formattedUrls = urls.map((url) => ({
    ...url,
    clicks: url.urlClicks?.clicks || 0,
    tags: url.tags.map((t) => t.tagString),
  }))

  return NextResponse.json({ urls: formattedUrls, count })
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { shortUrl, longUrl, description, isFile } = body

    if (!longUrl) {
      return NextResponse.json(
        { message: 'Long URL is required.' },
        { status: 400 },
      )
    }

    const fullLongUrl = isFile ? longUrl : longUrl
    if (!isFile && !isValidUrl(fullLongUrl, DEV_ENV)) {
      return NextResponse.json(
        { message: 'Invalid long URL.' },
        { status: 400 },
      )
    }

    if (isBlacklisted(fullLongUrl)) {
      return NextResponse.json(
        { message: 'Long URL is not allowed.' },
        { status: 400 },
      )
    }

    if (isCircularRedirects(fullLongUrl, new URL(OG_URL).hostname)) {
      return NextResponse.json(
        { message: 'Circular redirect detected.' },
        { status: 400 },
      )
    }

    if (shortUrl && !isValidShortUrl(shortUrl)) {
      return NextResponse.json(
        { message: 'Short URL can only consist of lowercase letters, numbers, and hyphens.' },
        { status: 400 },
      )
    }

    // Check if short URL already exists
    if (shortUrl) {
      const existing = await prisma.url.findUnique({
        where: { shortUrl },
      })
      if (existing) {
        return NextResponse.json(
          { message: 'Short URL already exists.' },
          { status: 409 },
        )
      }
    }

    const url = await prisma.url.create({
      data: {
        shortUrl: shortUrl || generateShortUrl(),
        longUrl: fullLongUrl,
        description: description || '',
        isFile: isFile || false,
        userId: user.id,
        source: 'CONSOLE',
      },
      include: {
        urlClicks: true,
      },
    })

    // Create initial click count
    await prisma.urlClicks.create({
      data: { shortUrl: url.shortUrl, clicks: 0 },
    })

    // Create URL history entry
    await prisma.urlHistory.create({
      data: {
        urlShortUrl: url.shortUrl,
        longUrl: url.longUrl,
        state: url.state,
        isFile: url.isFile,
        contactEmail: url.contactEmail,
        description: url.description,
        source: url.source,
        userId: user.id,
      },
    })

    return NextResponse.json(url, { status: 201 })
  } catch (error) {
    console.error('Error creating URL:', error)
    return NextResponse.json(
      { message: 'Error creating URL.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { shortUrl, longUrl, state, description, contactEmail } = body

    if (!shortUrl) {
      return NextResponse.json(
        { message: 'Short URL is required.' },
        { status: 400 },
      )
    }

    // Check ownership
    const existing = await prisma.url.findUnique({
      where: { shortUrl },
      select: { userId: true },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { message: 'URL not found or unauthorized.' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = {}
    if (longUrl !== undefined) updateData.longUrl = longUrl
    if (state !== undefined) updateData.state = state
    if (description !== undefined) updateData.description = description
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail

    const updated = await prisma.url.update({
      where: { shortUrl },
      data: updateData,
    })

    // Create URL history entry
    await prisma.urlHistory.create({
      data: {
        urlShortUrl: updated.shortUrl,
        longUrl: updated.longUrl,
        state: updated.state,
        isFile: updated.isFile,
        contactEmail: updated.contactEmail,
        description: updated.description,
        source: updated.source,
        userId: user.id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating URL:', error)
    return NextResponse.json(
      { message: 'Error updating URL.' },
      { status: 500 },
    )
  }
}

function generateShortUrl(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
