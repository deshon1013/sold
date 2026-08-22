import { useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { logOut } from '../../lib/auth'
import type { User } from '../../types/user'

interface UserMenuProps {
  user: User
}

function getInitials({ name, email }: User): string {
  const source = name.trim() || email
  const parts = source.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  // Just the toggle for now -- wiring this to an actual theme provider is
  // coming in a separate branch alongside the rest of the theme work.
  const [darkMode, setDarkMode] = useState(false)

  function closeMenu() {
    setAnchorEl(null)
  }

  function handleProfile() {
    closeMenu()
    navigate('/profile')
  }

  function handleLogout() {
    closeMenu()
    logOut()
  }

  function handleAbout() {
    closeMenu()
    setAboutOpen(true)
  }

  return (
    <>
      <IconButton
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        size="small"
        aria-label="Account menu"
        aria-haspopup="menu"
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{getInitials(user)}</Avatar>
      </IconButton>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
        <Box sx={{ px: 2, py: 1, maxWidth: 240 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {user.name || user.email}
          </Typography>
          {user.name && (
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {user.email}
            </Typography>
          )}
        </Box>
        <Divider />

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={(event) => event.stopPropagation()} sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DarkModeOutlinedIcon fontSize="small" />
            <ListItemText>Dark mode</ListItemText>
          </Box>
          <Switch
            size="small"
            checked={darkMode}
            onChange={(event) => setDarkMode(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'Toggle dark mode' } }}
          />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleAbout}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>About</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={aboutOpen} onClose={() => setAboutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>About Sold</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Version {__APP_VERSION__}</Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}
