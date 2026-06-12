import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export interface SessionUser {
  id: number
  email: string
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = session.user as Record<string, unknown>
  if (!user.id || !user.email) return null
  return { id: user.id as number, email: user.email as string }
}
