'use client'

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import copy from 'copy-to-clipboard'
import BaseLayout from '@/components/BaseLayout'

interface UrlRecord {
  shortUrl: string
  longUrl: string
  state: string
  isFile: boolean
  description: string
  contactEmail: string | null
  clicks: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

const DISPLAY_HOSTNAME = 'go.gov.sg'

async function fetchUrls(params: {
  limit: number
  offset: number
  searchText: string
}) {
  const sp = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
    searchText: params.searchText,
    orderBy: 'createdAt',
    sortDirection: 'desc',
  })
  const res = await fetch(`/api/urls?${sp}`)
  if (!res.ok) throw new Error('Failed to fetch URLs')
  return res.json() as Promise<{ urls: UrlRecord[]; count: number }>
}

async function createUrl(data: {
  shortUrl?: string
  longUrl: string
  description?: string
}) {
  const res = await fetch('/api/urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to create URL')
  }
  return res.json()
}

async function updateUrl(data: {
  shortUrl: string
  longUrl?: string
  state?: string
  description?: string
}) {
  const res = await fetch('/api/urls', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to update URL')
  }
  return res.json()
}

export default function UserPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUrl, setEditUrl] = useState<UrlRecord | null>(null)

  // Debounce search
  const handleSearch = useCallback((text: string) => {
    setSearchText(text)
    const timer = setTimeout(() => {
      setDebouncedSearch(text)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['urls', rowsPerPage, page, debouncedSearch],
    queryFn: () =>
      fetchUrls({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        searchText: debouncedSearch,
      }),
    enabled: status === 'authenticated',
  })

  const createMutation = useMutation({
    mutationFn: createUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] })
      setCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] })
      setEditUrl(null)
    },
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          My Links
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Create link
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search your links..."
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Links table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Short Link</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data?.urls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {debouncedSearch
                      ? 'No links match your search.'
                      : 'No links yet. Create your first link!'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.urls.map((url) => (
                <TableRow key={url.shortUrl} hover>
                  <TableCell>
                    <Box>
                      <MuiLink
                        href={`https://${DISPLAY_HOSTNAME}/${url.shortUrl}`}
                        target="_blank"
                        rel="noopener"
                        sx={{ fontWeight: 600 }}
                      >
                        {DISPLAY_HOSTNAME}/{url.shortUrl}
                      </MuiLink>
                      {url.description && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {url.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {url.longUrl}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {url.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={url.state}
                      color={url.state === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Copy short link">
                      <IconButton
                        size="small"
                        onClick={() =>
                          copy(`https://${DISPLAY_HOSTNAME}/${url.shortUrl}`)
                        }
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => setEditUrl(url)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="QR Code">
                      <IconButton
                        size="small"
                        onClick={() => {
                          window.open(
                            `/api/qrcode?shortUrl=${url.shortUrl}`,
                            '_blank',
                          )
                        }}
                      >
                        <QrCodeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

      {/* Create URL Dialog */}
      <CreateUrlDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
        error={createMutation.error?.message}
      />

      {/* Edit URL Dialog */}
      {editUrl && (
        <EditUrlDialog
          url={editUrl}
          open={!!editUrl}
          onClose={() => setEditUrl(null)}
          onSubmit={(data) => updateMutation.mutate(data)}
          loading={updateMutation.isPending}
          error={updateMutation.error?.message}
        />
      )}
    </BaseLayout>
  )
}

function CreateUrlDialog({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: { shortUrl?: string; longUrl: string; description?: string }) => void
  loading: boolean
  error?: string
}) {
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      longUrl,
      shortUrl: shortUrl || undefined,
      description: description || undefined,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create new link</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Original URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Custom short link (optional)"
            value={shortUrl}
            onChange={(e) => setShortUrl(e.target.value.toLowerCase())}
            placeholder="my-custom-link"
            helperText={`${DISPLAY_HOSTNAME}/${shortUrl || '<generated>'}`}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || !longUrl}>
            {loading ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

function EditUrlDialog({
  url,
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  url: UrlRecord
  open: boolean
  onClose: () => void
  onSubmit: (data: { shortUrl: string; longUrl?: string; state?: string; description?: string }) => void
  loading: boolean
  error?: string
}) {
  const [longUrl, setLongUrl] = useState(url.longUrl)
  const [description, setDescription] = useState(url.description)
  const [state, setState] = useState(url.state)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      shortUrl: url.shortUrl,
      longUrl: longUrl !== url.longUrl ? longUrl : undefined,
      description: description !== url.description ? description : undefined,
      state: state !== url.state ? state : undefined,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Edit {DISPLAY_HOSTNAME}/{url.shortUrl}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Original URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="State"
            select
            value={state}
            onChange={(e) => setState(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
