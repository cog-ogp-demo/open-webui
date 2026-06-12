'use client'

import React, { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import BaseLayout from '@/components/BaseLayout'

type FormView = 'email' | 'otp'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [view, setView] = useState<FormView>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailGlobExpression, setEmailGlobExpression] = useState('')

  useEffect(() => {
    if (session) router.push('/user')
  }, [session, router])

  useEffect(() => {
    fetch('/api/auth/emaildomains')
      .then((r) => r.json())
      .then((data) => setEmailGlobExpression(data.expression))
      .catch(() => {})
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to send OTP.')
      } else {
        setView('otp')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('otp', {
        redirect: false,
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      })
      if (result?.error) {
        setError('Invalid OTP or OTP has expired.')
      } else {
        router.push('/user')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (session) return null

  return (
    <BaseLayout>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Log in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {emailGlobExpression
              ? `Only ${emailGlobExpression} emails are accepted.`
              : 'Sign in with your government email.'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {view === 'email' ? (
            <form onSubmit={handleSendOtp}>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                We sent a one-time password to <strong>{email}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                autoFocus
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !otp}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify'}
                </Button>
              </Box>
              <Button
                onClick={() => {
                  setView('email')
                  setOtp('')
                  setError('')
                }}
                sx={{ mt: 1 }}
                size="small"
              >
                Resend OTP
              </Button>
            </form>
          )}
        </Paper>
      </Container>
    </BaseLayout>
  )
}
