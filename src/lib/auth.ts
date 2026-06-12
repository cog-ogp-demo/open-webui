import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { Minimatch } from 'minimatch'
import { prisma } from './prisma'
import { storeOtp, getStoredOtp, deleteOtp } from './redis'
import { sendOtpEmail } from './email'

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10

const validEmailGlob = process.env.VALID_EMAIL_GLOB_EXPRESSION || '*.gov.sg'
const emailMatcher = new Minimatch(validEmailGlob, {
  noext: false,
  noglobstar: true,
  nobrace: true,
  nonegate: true,
})

export function isValidEmailDomain(email: string): boolean {
  return emailMatcher.match(email)
}

export async function generateAndSendOtp(email: string): Promise<void> {
  const otp = nanoid(6).replace(/[^0-9a-zA-Z]/g, '').slice(0, 6).toUpperCase()
  const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS)
  await storeOtp(email, hashedOtp)
  await sendOtpEmail(email, otp)
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<boolean> {
  const storedHash = await getStoredOtp(email)
  if (!storedHash) return false
  const isValid = await bcrypt.compare(otp.toUpperCase(), storedHash)
  if (isValid) await deleteOtp(email)
  return isValid
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'OTP Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null
        const email = credentials.email.trim().toLowerCase()
        const isValid = await verifyOtp(email, credentials.otp)
        if (!isValid) return null

        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({ data: { email } })
        }
        return { id: String(user.id), email: user.email ?? email }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id)
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.userId
        session.user.email = token.email as string
      }
      return session
    },
  },
}
