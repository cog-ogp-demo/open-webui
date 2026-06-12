import { Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 12 }}>
      <Typography variant="h1" fontWeight={700} color="primary">
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The link you are looking for does not exist or has been deactivated.
      </Typography>
      <Button component={Link} href="/" variant="contained" size="large">
        Go to homepage
      </Button>
    </Container>
  )
}
