import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// TODO: real profile editing (avatar upload, display name, etc.) lands in a separate branch.
export function ProfilePage() {
  return (
    <Container maxWidth="sm" sx={{ flex: 1, py: 4 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
        Profile
      </Typography>
      <Typography color="text.secondary">Profile editing is coming soon.</Typography>
    </Container>
  )
}
