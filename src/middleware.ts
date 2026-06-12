import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that should NOT be treated as short URLs
const RESERVED_PATHS = new Set([
  '_next',
  'api',
  'login',
  'user',
  'directory',
  'apiintegration',
  'favicon.ico',
  'assets',
  '404',
])

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip reserved paths
  const firstSegment = pathname.split('/')[1]
  if (!firstSegment || RESERVED_PATHS.has(firstSegment)) {
    return NextResponse.next()
  }

  // Check if the path matches a short URL pattern: alphanumeric + hyphens
  if (/^\/[a-zA-Z0-9-]+\??/.test(pathname)) {
    // Rewrite to our redirect handler API route
    const shortUrl = firstSegment.toLowerCase()
    const url = request.nextUrl.clone()
    url.pathname = `/api/redirect/${shortUrl}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match everything except _next, static files, and api routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
