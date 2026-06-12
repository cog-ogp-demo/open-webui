import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

const API_KEY_SALT = process.env.API_KEY_SALT || ''
const ADMIN_EMAILS = (process.env.ADMIN_API_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

async function authenticateAdminApiKey(
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
      select: { id: true, email: true },
    })
    if (!user || !user.email) return null
    if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) return null
    return { userId: user.id }
  } catch {
    return null
  }
}

export async function PATCH(request: Request) {
  const auth = await authenticateAdminApiKey(request)
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { shortUrl, longUrl, state, description } = body

    if (!shortUrl) {
      return NextResponse.json(
        { message: 'Short URL is required.' },
        { status: 400 },
      )
    }

    const url = await prisma.url.findUnique({ where: { shortUrl } })
    if (!url) {
      return NextResponse.json(
        { message: 'URL not found.' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = {}
    if (longUrl !== undefined) updateData.longUrl = longUrl
    if (state !== undefined) updateData.state = state
    if (description !== undefined) updateData.description = description

    const updated = await prisma.url.update({
      where: { shortUrl },
      data: updateData,
    })

    await prisma.urlHistory.create({
      data: {
        urlShortUrl: updated.shortUrl,
        longUrl: updated.longUrl,
        state: updated.state,
        isFile: updated.isFile,
        description: updated.description,
        source: updated.source,
        userId: auth.userId,
      },
    })

    return NextResponse.json({
      shortUrl: updated.shortUrl,
      longUrl: updated.longUrl,
      state: updated.state,
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 },
    )
  }
}
