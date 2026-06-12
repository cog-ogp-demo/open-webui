import { prisma } from '@/lib/prisma'
import HomeClient from './home-client'

async function getStats() {
  try {
    const [userCount, urlCount, clicksAgg] = await Promise.all([
      prisma.user.count(),
      prisma.url.count(),
      prisma.urlClicks.aggregate({ _sum: { clicks: true } }),
    ])
    return {
      userCount,
      linkCount: urlCount,
      clickCount: clicksAgg._sum.clicks || 0,
    }
  } catch {
    return { userCount: 0, linkCount: 0, clickCount: 0 }
  }
}

export default async function HomePage() {
  const stats = await getStats()
  return <HomeClient stats={stats} />
}
