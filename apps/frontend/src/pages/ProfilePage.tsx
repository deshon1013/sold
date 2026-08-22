import { useEffect, useRef, useState } from 'react'
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
import { deleteFile, uploadFile } from '../lib/uploads'

// TODO: rest of profile logic (bio, etc.) lands alongside the theme work in a separate branch.
export function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? '')
  // Picking a photo only stages it locally -- it's uploaded together with
  // the rest of the form when "Save changes" is pressed, so a picture-only
  // change and a name-only change both go through the same single action.
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!user) return null

  const nameChanged = name.trim() !== '' && name.trim() !== user.name
  const hasChanges = nameChanged || !!pendingAvatarFile

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setSaved(false)
    setError(null)
  }

  async function handleSave(event: SubmitEvent) {
    event.preventDefault()
    setSaved(false)

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }

    setError(null)
    setSaving(true)
    try {
      const previousAvatarUrl = user?.avatarUrl
      const avatarUrl = pendingAvatarFile ? await uploadFile(pendingAvatarFile, 'avatar') : undefined

      await updateProfile({
        ...(nameChanged ? { name: trimmed } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
      })

      // Users only ever have one avatar -- clean up the old file now that the
      // new one is safely saved. Best-effort: a failure here shouldn't undo
      // (or even surface as an error on) the profile save that just succeeded.
      if (avatarUrl && previousAvatarUrl) {
        deleteFile(previousAvatarUrl, 'avatar').catch((err: unknown) => {
          console.error('Failed to delete previous avatar', err)
        })
      }

      setPendingAvatarFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ flex: 1, py: 4 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
        Profile
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, mt: 2 }}>
        <Stack component="form" onSubmit={handleSave} noValidate spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
          >
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={previewUrl ?? user.avatarUrl} sx={{ width: 140, height: 140, fontSize: 48 }}>
                {getInitials(user.name || user.email)}
              </Avatar>

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
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
              {error && <Alert severity="error">{error}</Alert>}
              {saved && <Alert severity="success">Saved.</Alert>}

              <TextField
                label="Name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setError(null)
                  setSaved(false)
                }}
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
                disabled={saving || !hasChanges}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
