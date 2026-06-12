import UAParser from 'ua-parser-js'
import { prisma } from './prisma'

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'others'

function getDeviceType(userAgent: string): DeviceType {
  const parser = new UAParser(userAgent)
  const device = parser.getDevice().type
  if (device === 'mobile') return 'mobile'
  if (device === 'tablet') return 'tablet'
  if (device) return 'others'
  return 'desktop'
}

export async function updateLinkStatistics(
  shortUrl: string,
  userAgent: string,
): Promise<void> {
  const now = new Date()
  const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekday = now.getDay()
  const hours = now.getHours()
  const deviceType = getDeviceType(userAgent)

  await Promise.all([
    // Increment total clicks
    prisma.urlClicks.upsert({
      where: { shortUrl },
      update: { clicks: { increment: 1 } },
      create: { shortUrl, clicks: 1 },
    }),

    // Increment daily clicks
    prisma.dailyClicks.upsert({
      where: { shortUrl_date: { shortUrl, date: dateOnly } },
      update: { clicks: { increment: 1 } },
      create: { shortUrl, date: dateOnly, clicks: 1 },
    }),

    // Increment weekday/hour clicks
    prisma.weekdayClicks.upsert({
      where: {
        shortUrl_weekday_hours: { shortUrl, weekday, hours },
      },
      update: { clicks: { increment: 1 } },
      create: { shortUrl, weekday, hours, clicks: 1 },
    }),

    // Increment device clicks
    prisma.devices.upsert({
      where: { shortUrl },
      update: { [deviceType]: { increment: 1 } },
      create: { shortUrl, [deviceType]: 1 },
    }),
  ])
}
