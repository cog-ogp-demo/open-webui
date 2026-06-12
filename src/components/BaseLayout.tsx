'use client'

import React from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

interface BaseLayoutProps {
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
}

export default function BaseLayout({
  children,
  maxWidth = 'lg',
}: BaseLayoutProps) {
  const { data: session } = useSession()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        color="primary"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Go.gov.sg
          </Typography>

          {session ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                color="inherit"
                component={Link}
                href="/user"
                size="small"
              >
                My Links
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/directory"
                size="small"
              >
                Directory
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/apiintegration"
                size="small"
              >
                API
              </Button>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {session.user?.email}
              </Typography>
              <Button
                color="inherit"
                onClick={() => signOut({ callbackUrl: '/' })}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Log out
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              component={Link}
              href="/login"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Log in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, py: 3 }}>
        {maxWidth ? (
          <Container maxWidth={maxWidth}>{children}</Container>
        ) : (
          children
        )}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: 'grey.100',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Built by{' '}
          <a
            href="https://open.gov.sg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Government Products
          </a>
          , GovTech Singapore
        </Typography>
      </Box>
    </Box>
  )
}
