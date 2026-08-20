import { useState } from 'react'
import type { ChangeEvent, SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../context/useAuth'
import { uploadFile } from '../lib/uploads'
import { insertVideo } from '../lib/videos'

type FieldErrors = { title?: string; gameTitle?: string; videoFile?: string }
type Status = 'idle' | 'video' | 'thumbnail' | 'saving'

const STATUS_LABEL: Record<Exclude<Status, 'idle'>, string> = {
  video: 'Uploading video…',
  thumbnail: 'Uploading thumbnail…',
  saving: 'Saving…',
}

export function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [gameTitle, setGameTitle] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submitting = status !== 'idle'

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    setVideoFile(event.target.files?.[0] ?? null)
    setErrors((prev) => ({ ...prev, videoFile: undefined }))
  }

  function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    setThumbnailFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!user) return
    setSubmitError(null)

    const fieldErrors: FieldErrors = {
      title: title.trim() ? undefined : 'Title is required',
      gameTitle: gameTitle.trim() ? undefined : 'Game title is required',
      videoFile: videoFile ? undefined : 'Choose a video file',
    }
    setErrors(fieldErrors)
    if (Object.values(fieldErrors).some(Boolean)) return

    try {
      setStatus('video')
      const videoUrl = await uploadFile(videoFile!, 'video')

      let thumbnailUrl: string | undefined
      if (thumbnailFile) {
        setStatus('thumbnail')
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnail')
      }

      setStatus('saving')
      const video = await insertVideo({
        title: title.trim(),
        gameTitle: gameTitle.trim(),
        videoUrl,
        thumbnailUrl,
        uploadedBy: user.id,
        uploadedByName: user.name || user.email,
      })

      navigate(`/videos/${video.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ flex: 1, py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
          Upload a clip
        </Typography>

        <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors((prev) => ({ ...prev, title: undefined }))
            }}
            error={!!errors.title}
            helperText={errors.title}
            disabled={submitting}
            fullWidth
            required
          />

          <TextField
            label="Game title"
            value={gameTitle}
            onChange={(e) => {
              setGameTitle(e.target.value)
              setErrors((prev) => ({ ...prev, gameTitle: undefined }))
            }}
            error={!!errors.gameTitle}
            helperText={errors.gameTitle}
            disabled={submitting}
            fullWidth
            required
          />

          <Box>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={submitting}>
              {videoFile ? videoFile.name : 'Choose video'}
              <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
            </Button>
            {errors.videoFile && (
              <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {errors.videoFile}
              </Typography>
            )}
          </Box>

          <Box>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={submitting}>
              {thumbnailFile ? thumbnailFile.name : 'Choose thumbnail (optional)'}
              <input type="file" accept="image/*" hidden onChange={handleThumbnailChange} />
            </Button>
          </Box>

          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? (
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <CircularProgress size={20} color="inherit" />
                <span>{STATUS_LABEL[status as Exclude<Status, 'idle'>]}</span>
              </Stack>
            ) : (
              'Upload'
            )}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
