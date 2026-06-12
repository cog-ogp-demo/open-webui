import Redis from 'ioredis'

function createRedisClient(url: string | undefined): Redis | null {
  if (!url) return null
  return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 })
}

export const otpClient = createRedisClient(process.env.REDIS_OTP_URI)
export const sessionClient = createRedisClient(process.env.REDIS_SESSION_URI)
export const redirectClient = createRedisClient(process.env.REDIS_REDIRECT_URI)
export const statClient = createRedisClient(process.env.REDIS_STAT_URI)
export const safeBrowsingClient = createRedisClient(
  process.env.REDIS_SAFE_BROWSING_URI,
)

const REDIRECT_CACHE_TTL = Number(process.env.REDIRECT_EXPIRY) || 300
const OTP_TTL = Number(process.env.OTP_EXPIRY) || 300

export async function cacheRedirect(
  shortUrl: string,
  longUrl: string,
): Promise<void> {
  await redirectClient?.set(
    `redirect:${shortUrl}`,
    longUrl,
    'EX',
    REDIRECT_CACHE_TTL,
  )
}

export async function getCachedRedirect(
  shortUrl: string,
): Promise<string | null> {
  return (await redirectClient?.get(`redirect:${shortUrl}`)) ?? null
}

export async function storeOtp(
  email: string,
  hashedOtp: string,
): Promise<void> {
  await otpClient?.set(`otp:${email}`, hashedOtp, 'EX', OTP_TTL)
}

export async function getStoredOtp(email: string): Promise<string | null> {
  return (await otpClient?.get(`otp:${email}`)) ?? null
}

export async function deleteOtp(email: string): Promise<void> {
  await otpClient?.del(`otp:${email}`)
}
