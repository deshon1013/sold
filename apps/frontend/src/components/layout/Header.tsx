import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../context/useAuth'
import { UserMenu } from './UserMenu'

export function Header() {
  const { user } = useAuth()

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none' }}
        >
          <Box component="img" src="/favicon.png" alt="" sx={{ width: 28, height: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Sold
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={RouterLink} to="/upload" variant="contained" size="small">
              Upload
            </Button>
            <UserMenu user={user} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
