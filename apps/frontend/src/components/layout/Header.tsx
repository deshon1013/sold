import { useState } from 'react'
import type { ChangeEvent, SubmitEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../context/useAuth'
import { useSearch } from '../../context/useSearch'
import { UserMenu } from './UserMenu'

export function Header() {
  const { user } = useAuth()
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const onHomePage = location.pathname === '/'

  const [inputValue, setInputValue] = useState(query)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setInputValue(value)
    // Already on the homepage -- filter live as they type. Anywhere else,
    // buffer locally and wait for submit so typing doesn't yank them away
    // from what they're doing on every keystroke.
    if (onHomePage) setQuery(value)
  }

  function handleSearchSubmit(event: SubmitEvent) {
    event.preventDefault()
    setQuery(inputValue)
    if (!onHomePage) navigate('/')
  }

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none', flexShrink: 0 }}
        >
          <Box component="img" src="/favicon.png" alt="" sx={{ width: 28, height: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Sold
          </Typography>
        </Box>

        {user && (
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <TextField
              value={inputValue}
              onChange={handleSearchChange}
              placeholder="Search videos"
              size="small"
              sx={(theme) => ({
                width: '100%',
                maxWidth: 480,
                ...(theme.palette.mode === 'light' && {
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000',
                  },
                }),
              })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        )}

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
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
