'use client'

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  CircularProgress,
  Container,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import BaseLayout from '@/components/BaseLayout'

const DISPLAY_HOSTNAME = 'go.gov.sg'

interface DirectoryUrl {
  shortUrl: string
  longUrl: string
  description: string
  email: string
  clicks: number
  createdAt: string
}

async function searchDirectory(params: {
  query: string
  limit: number
  offset: number
  isEmail: boolean
}) {
  const sp = new URLSearchParams({
    query: params.query,
    limit: String(params.limit),
    offset: String(params.offset),
    isEmail: String(params.isEmail),
    orderBy: 'createdAt',
    sortDirection: 'desc',
  })
  const res = await fetch(`/api/directory/search?${sp}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json() as Promise<{ urls: DirectoryUrl[]; count: number }>
}

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchMode, setSearchMode] = useState<'keyword' | 'email'>('keyword')

  const handleSearch = useCallback((text: string) => {
    setSearchText(text)
    const timer = setTimeout(() => {
      setDebouncedSearch(text)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['directory', debouncedSearch, rowsPerPage, page, searchMode],
    queryFn: () =>
      searchDirectory({
        query: debouncedSearch,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        isEmail: searchMode === 'email',
      }),
    enabled: status === 'authenticated',
  })

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

  return (
    <BaseLayout>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Directory
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search all public go.gov.sg links by keyword or email.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder={
            searchMode === 'email'
              ? 'Search by email address...'
              : 'Search by keyword...'
          }
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup
          value={searchMode}
          exclusive
          onChange={(_, val) => val && setSearchMode(val)}
          size="small"
        >
          <ToggleButton value="keyword">Keyword</ToggleButton>
          <ToggleButton value="email">Email</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Short Link</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell align="right">Clicks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data?.urls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {debouncedSearch
                      ? 'No results found.'
                      : 'Search for links to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.urls.map((url) => (
                <TableRow key={url.shortUrl} hover>
                  <TableCell>
                    <MuiLink
                      href={`https://${DISPLAY_HOSTNAME}/${url.shortUrl}`}
                      target="_blank"
                      rel="noopener"
                      fontWeight={600}
                    >
                      {DISPLAY_HOSTNAME}/{url.shortUrl}
                    </MuiLink>
                    {url.description && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {url.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {url.longUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{url.email}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {url.clicks.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.count || 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>
    </BaseLayout>
  )
}
