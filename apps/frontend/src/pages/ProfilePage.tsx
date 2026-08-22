import { useRef, useState } from 'react'
import type { ChangeEvent, SubmitEvent } from 'react'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../context/useAuth'
import { updateProfile } from '../lib/auth'
import { getInitials } from '../lib/avatar'
import { uploadFile } from '../lib/uploads'

// TODO: rest of profile logic (bio, etc.) lands alongside the theme work in a separate branch.
export function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  if (!user) return null

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file next time
    if (!file) return

    setAvatarError(null)
    setAvatarUploading(true)
    try {
      const avatarUrl = await uploadFile(file, 'avatar')
      await updateProfile({ avatarUrl })
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not update your avatar.')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSaveName(event: SubmitEvent) {
    event.preventDefault()
    setNameSaved(false)

    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Name is required')
      return
    }

    setNameError(null)
    setSavingName(true)
    try {
      await updateProfile({ name: trimmed })
      setNameSaved(true)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Could not save your name.')
    } finally {
      setSavingName(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ flex: 1, py: 4 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
        Profile
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, mt: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
        >
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar src={user.avatarUrl} sx={{ width: 140, height: 140, fontSize: 48 }}>
              {getInitials(user)}
            </Avatar>

            {avatarUploading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '50%',
                }}
              >
                <CircularProgress size={32} sx={{ color: 'common.white' }} />
              </Box>
            )}

            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              size="small"
              aria-label="Change avatar"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <PhotoCameraOutlinedIcon fontSize="small" />
            </IconButton>

            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </Box>

          <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
            {avatarError && <Alert severity="error">{avatarError}</Alert>}

            <Stack component="form" spacing={2} onSubmit={handleSaveName} noValidate>
              {nameError && <Alert severity="error">{nameError}</Alert>}
              {nameSaved && <Alert severity="success">Saved.</Alert>}

              <TextField
                label="Name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setNameError(null)
                  setNameSaved(false)
                }}
                error={!!nameError}
                helperText={nameError}
                fullWidth
                required
              />

              <TextField
                label="Email"
                value={user.email}
                fullWidth
                disabled
                helperText="Contact support to change your email"
              />

              <Button
                type="submit"
                variant="contained"
                disabled={savingName || name.trim() === user.name}
                sx={{ alignSelf: 'flex-start' }}
              >
                {savingName ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
