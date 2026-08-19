import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { AuthCard } from './components/auth/AuthCard'
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
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 2,
      }}
    >
      {checkingSession ? (
        <CircularProgress />
      ) : user ? (
        <Paper elevation={2} sx={{ maxWidth: 400, width: '100%', p: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
            Signed in
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {user.name ? `${user.name} — ` : ''}
            {user.email}
          </Typography>
          <Button variant="outlined" onClick={() => logOut()} sx={{ mt: 2 }}>
            Log out
          </Button>
        </Paper>
      ) : (
        <>
          {signUpNotice && (
            <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
              {signUpNotice}
            </Alert>
          )}
          <AuthCard onLogin={handleLogin} onSignUp={handleSignUp} />
        </>
      )}
    </Box>
  )
}

export default App
