import { NextResponse } from 'next/server'
import { resolveRedirect } from '@/lib/redirect'
import { updateLinkStatistics } from '@/lib/statistics'
import { ASSET_VARIANT, DISPLAY_HOSTNAME } from '@/lib/config'

export async function GET(
  request: Request,
  { params }: { params: { shortUrl: string } },
) {
  const { shortUrl } = params

  const result = await resolveRedirect(shortUrl)

  if (!result) {
    // Return a 404 HTML page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>404 - Not Found</title></head>
        <body>
          <h1>404</h1>
          <p>The short link <strong>${DISPLAY_HOSTNAME}/${shortUrl}</strong> was not found.</p>
          <p><a href="/">Go back to ${DISPLAY_HOSTNAME}</a></p>
        </body>
      </html>`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      },
    )
  }

  // Update statistics asynchronously (fire-and-forget)
  const userAgent = request.headers.get('user-agent') || ''
  updateLinkStatistics(shortUrl, userAgent).catch(console.error)

  // Redirect to the long URL
  return NextResponse.redirect(result.longUrl, { status: 302 })
}
