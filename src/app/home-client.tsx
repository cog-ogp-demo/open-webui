'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import Link from 'next/link'
import BaseLayout from '@/components/BaseLayout'

interface Stats {
  userCount: number
  linkCount: number
  clickCount: number
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

export default function HomeClient({ stats }: { stats: Stats }) {
  const { data: session } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  React.useEffect(() => {
    if (session) {
      router.push('/user')
    }
  }, [session, router])

  if (session) return null

  return (
    <BaseLayout maxWidth={false}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 14 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            fontWeight={700}
            gutterBottom
          >
            Shorten links.
            <br />
            Build trust.
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}
          >
            The official Singapore government link shortener. Create
            authenticated and recognisable short links instantly.
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              color: theme.palette.primary.dark,
            }}
          >
            Get started
          </Button>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={600}
            gutterBottom
          >
            Trusted by the public service
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              { label: 'Links created', value: formatNumber(stats.linkCount) },
              { label: 'Clicks', value: formatNumber(stats.clickCount) },
              { label: 'Public officers', value: formatNumber(stats.userCount) },
            ].map((stat) => (
              <Grid item xs={12} md={4} key={stat.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="h3"
                    color="primary"
                    fontWeight={700}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={600}
            sx={{ mb: 6 }}
          >
            Why Go.gov.sg?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Official & Trusted',
                desc: 'Links from go.gov.sg are instantly recognisable as official government links.',
              },
              {
                title: 'Analytics',
                desc: 'Track click statistics, device breakdown, and daily trends for your links.',
              },
              {
                title: 'QR Codes',
                desc: 'Generate QR codes for any short link in PNG or SVG format.',
              },
              {
                title: 'File Sharing',
                desc: 'Upload and share files with short, memorable links.',
              },
              {
                title: 'Bulk Creation',
                desc: 'Create hundreds of links at once via CSV upload.',
              },
              {
                title: 'API Access',
                desc: 'Programmatically create and manage links with our REST API.',
              },
            ].map((feature) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </BaseLayout>
  )
}
