import { prisma } from './prisma'
import { getCachedRedirect, cacheRedirect } from './redis'
import { isValidShortUrl } from './validation'

export interface RedirectResult {
  longUrl: string
  isFile: boolean
}

export async function resolveRedirect(
  rawShortUrl: string,
): Promise<RedirectResult | null> {
  if (!isValidShortUrl(rawShortUrl)) return null

  const shortUrl = rawShortUrl.toLowerCase()

  // Check Redis cache first
  const cached = await getCachedRedirect(shortUrl)
  if (cached) {
    return { longUrl: cached, isFile: false }
  }

  // Fetch from database
  const url = await prisma.url.findUnique({
    where: { shortUrl },
    select: { longUrl: true, state: true, isFile: true },
  })

  if (!url || url.state !== 'ACTIVE') return null

  // Cache the result
  await cacheRedirect(shortUrl, url.longUrl)

  return { longUrl: url.longUrl, isFile: url.isFile }
}

export async function incrementClicks(shortUrl: string): Promise<void> {
  await prisma.urlClicks.upsert({
    where: { shortUrl },
    update: { clicks: { increment: 1 } },
    create: { shortUrl, clicks: 1 },
  })
}
