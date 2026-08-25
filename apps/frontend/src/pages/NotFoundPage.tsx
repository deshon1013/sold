import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function NotFoundPage() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 2,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: { xs: '5rem', sm: '7rem' }, lineHeight: 1 }}>404</Typography>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}
      >
        Page not found
      </Typography>

      <Typography
        component={RouterLink}
        to="/"
        sx={{
          mt: 6,
          color: 'primary.main',
          textDecoration: 'none',
          fontWeight: 600,
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        Why are you selling? Go home!
      </Typography>
    </Box>
  )
}
