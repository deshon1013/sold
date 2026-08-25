import { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import type { LoginFormValues, SignUpFormValues } from '../../types/user'

interface AuthCardProps {
  onLogin: (values: LoginFormValues) => Promise<void>
  onSignUp: (values: SignUpFormValues) => Promise<void>
  onForgotPassword: (email: string) => Promise<void>
}

export function AuthCard({ onLogin, onSignUp, onForgotPassword }: AuthCardProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  return (
    <Paper elevation={2} sx={{ maxWidth: 400, width: '100%', p: 4 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
        {tab === 'login' ? 'Welcome back' : 'Create your account'}
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, next) => setTab(next)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Log in" value="login" />
        <Tab label="Sign up" value="signup" />
      </Tabs>

      <Box role="tabpanel" hidden={tab !== 'login'}>
        {tab === 'login' && <LoginForm onSubmit={onLogin} onForgotPassword={onForgotPassword} />}
      </Box>
      <Box role="tabpanel" hidden={tab !== 'signup'}>
        {tab === 'signup' && <SignUpForm onSubmit={onSignUp} />}
      </Box>
    </Paper>
  )
}
