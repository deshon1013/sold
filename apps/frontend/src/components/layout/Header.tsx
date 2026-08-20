import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { User } from '../../types/user'

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          Sold
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.name || user.email}
            </Typography>
            <Button variant="outlined" size="small" onClick={onLogout}>
              Log out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
