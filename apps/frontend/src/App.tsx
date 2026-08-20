import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import { AuthCard } from './components/auth/AuthCard'
import { Layout } from './components/layout/Layout'
import { VideoGrid } from './components/videos/VideoGrid'
import { mockVideos } from './data/mockVideos'
import { getCurrentUser, logIn, logOut, onAuthChange, signUp } from './lib/auth'
import type { LoginFormValues, SignUpFormValues, User } from './types/user'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current)
      setCheckingSession(false)
    })
    return onAuthChange(setUser)
  }, [])

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
    <Layout user={user} onLogout={() => logOut()}>
      {checkingSession ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          {/* TODO: replace mockVideos with a real fetch from Supabase */}
          <VideoGrid videos={mockVideos} />
        </Container>
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
  )
}

export default App
