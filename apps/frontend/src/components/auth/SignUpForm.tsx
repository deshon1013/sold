import { useState } from 'react'
import type { SubmitEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { PasswordField } from './PasswordField'
import { validateEmail, validateName, validatePassword } from './validation'
import type { SignUpFormValues } from '../../types/user'

type FieldErrors = Partial<Record<keyof SignUpFormValues, string>>

interface SignUpFormProps {
  onSubmit: (values: SignUpFormValues) => Promise<void>
}

const initialValues: SignUpFormValues = { name: '', email: '', password: '' }

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [values, setValues] = useState<SignUpFormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(field: keyof SignUpFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): FieldErrors {
    return {
      name: validateName(values.name),
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
        label="Name"
        autoComplete="name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        required
      />

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
        autoComplete="new-password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={!!errors.password}
        helperText={errors.password ?? 'At least 8 characters'}
        fullWidth
        required
      />

      <Button type="submit" variant="contained" size="large" disabled={submitting}>
        {submitting ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
      </Button>
    </Stack>
  )
}
