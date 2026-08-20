import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import { Header } from './Header'
import type { User } from '../../types/user'

interface LayoutProps {
  user: User | null
  onLogout: () => void
  children: ReactNode
}

/** Page shell: header + main content area. `children` fills main and owns its own alignment. */
export function Layout({ user, onLogout, children }: LayoutProps) {
  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={onLogout} />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  )
}
