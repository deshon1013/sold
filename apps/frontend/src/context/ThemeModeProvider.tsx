import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { getTheme } from '../theme'
import { ThemeModeContext } from './themeModeContext'
import type { ThemeMode } from './themeModeContext'

const STORAGE_KEY = 'sold-theme-mode'

function getInitialMode(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeModeProviderProps {
  children: ReactNode
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
    // Keeps native browser chrome (scrollbars, form controls) in sync with the toggle.
    document.documentElement.style.colorScheme = mode
  }, [mode])

  const theme = useMemo(() => getTheme(mode), [mode])

  const value = useMemo(
    () => ({ mode, toggleMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')) }),
    [mode],
  )

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
