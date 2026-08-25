import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { AuthCard } from './components/auth/AuthCard'
import { Layout } from './components/layout/Layout'
import { SearchProvider } from './context/SearchProvider'
import { useAuth } from './context/useAuth'
import { logIn, signUp } from './lib/auth'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { UploadPage } from './pages/UploadPage'
import { VideoPage } from './pages/VideoPage'
import type { LoginFormValues, SignUpFormValues } from './types/user'

function App() {
  const { user, checkingSession } = useAuth()
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null)

  async function handleLogin(values: LoginFormValues) {
    setSignUpNotice(null)
    await logIn(values)
  }

  async function handleSignUp(values: SignUpFormValues) {
    const created = await signUp(values)
    if (!created) {
      setSignUpNotice('Account created — check your email to confirm it before logging in.')
    }
  }

  return (
    <SearchProvider>
      <Layout>
        {checkingSession ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/videos/:id" element={<VideoPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 2,
            }}
          >
            {signUpNotice && (
              <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
                {signUpNotice}
              </Alert>
            )}
            <AuthCard onLogin={handleLogin} onSignUp={handleSignUp} />
          </Box>
        )}
      </Layout>
    </SearchProvider>
  )
}

export default App
