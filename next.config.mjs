/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'nodemailer', 'sharp'],
  },
  headers: async () => {
    const s3Bucket = process.env.AWS_S3_BUCKET || ''
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/",
              "font-src 'self' https://fonts.gstatic.com/",
              `img-src 'self' data: https://${s3Bucket}/`,
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "worker-src blob:",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  // Allow redirects from short URLs to pass through
  async rewrites() {
    return []
  },
}

export default nextConfig
