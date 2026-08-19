import { useState } from 'react'
import type { SubmitEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { PasswordField } from './PasswordField'
import { validateEmail, validatePassword } from './validation'
import type { LoginFormValues } from '../../types/user'

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>
}

const initialValues: LoginFormValues = { email: '', password: '' }

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(field: keyof LoginFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): FieldErrors {
    return {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setSubmitError(null)

    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.values(fieldErrors).some(Boolean)) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
      {submitError && <Alert severity="error">{submitError}</Alert>}

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        required
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        fullWidth
        required
      />

      <Button type="submit" variant="contained" size="large" disabled={submitting}>
        {submitting ? <CircularProgress size={22} color="inherit" /> : 'Log in'}
      </Button>
    </Stack>
  )
}
