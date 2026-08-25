import { useState } from 'react'
import type { SubmitEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PasswordField } from '../components/auth/PasswordField'
import { validatePassword } from '../components/auth/validation'
import { useAuth } from '../context/useAuth'
import { updatePassword } from '../lib/auth'

/** Shown in place of the whole app while a password-recovery session (from the emailed link) is active. */
export function ResetPasswordPage() {
  const { clearPasswordRecovery } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [confirmError, setConfirmError] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setSubmitError(null)

    const nextPasswordError = validatePassword(password)
    const nextConfirmError = password !== confirmPassword ? 'Passwords do not match' : undefined
    setPasswordError(nextPasswordError)
    setConfirmError(nextConfirmError)
    if (nextPasswordError || nextConfirmError) return

    setSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not update your password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={2} sx={{ maxWidth: 400, width: '100%', p: 4 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
          Set a new password
        </Typography>

        {done ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="success">Your password has been updated.</Alert>
            <Button variant="contained" size="large" onClick={clearPasswordRecovery}>
              Continue
            </Button>
          </Stack>
        ) : (
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <PasswordField
              label="New password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(undefined)
              }}
              error={!!passwordError}
              helperText={passwordError}
              fullWidth
              required
            />

            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmError(undefined)
              }}
              error={!!confirmError}
              helperText={confirmError}
              fullWidth
              required
            />

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Update password'}
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
