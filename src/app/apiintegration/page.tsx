'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import BaseLayout from '@/components/BaseLayout'

export default function ApiIntegrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'loading') {
    return (
      <BaseLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </BaseLayout>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleGenerateKey = async () => {
    setLoading(true)
    setError('')
    try {
      // TODO: Implement API key generation endpoint
      setApiKey('API key generation coming soon')
    } catch {
      setError('Failed to generate API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseLayout>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        API Integration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Use the GoGovSG API to programmatically create and manage short links.
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, mb: 4, borderRadius: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Your API Key
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use this key in the <code>Authorization: Bearer &lt;key&gt;</code>{' '}
          header when making API calls.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {apiKey ? (
          <TextField
            fullWidth
            value={apiKey}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2, fontFamily: 'monospace' }}
          />
        ) : (
          <Button
            variant="contained"
            onClick={handleGenerateKey}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Generate API Key'}
          </Button>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          API Documentation
        </Typography>
        <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Create a short URL
            </Typography>
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto' }}>
{`POST /api/v1/urls
Authorization: Bearer <your-api-key>
Content-Type: application/json

{
  "longUrl": "https://example.com/very-long-url",
  "shortUrl": "my-custom-link"  // optional
}`}
            </pre>
          </Box>
        </Typography>
      </Paper>
    </BaseLayout>
  )
}
