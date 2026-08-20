import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactPlayer from 'react-player'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { relativeTime } from '../lib/relativeTime'
import { fetchVideoById } from '../lib/videos'
import type { Video } from '../types/video'

export function VideoPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  // key={id} forces a fresh mount (and thus fresh state) whenever the route param changes.
  return <VideoPageContent key={id} id={id} />
}

function VideoPageContent({ id }: { id: string }) {
  // undefined = still loading, null = fetched but not found
  const [video, setVideo] = useState<Video | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideoById(id)
      .then(setVideo)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load video'))
  }, [id])

  if (error) {
    return (
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (video === undefined) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (video === null) {
    return (
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        <Alert severity="warning">That video doesn't exist, or was deleted.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
      <Box sx={{ aspectRatio: '16 / 9', bgcolor: 'common.black', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
        <ReactPlayer src={video.videoUrl} controls width="100%" height="100%" />
      </Box>

      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
        {video.title}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Chip label={video.gameTitle} size="small" variant="outlined" />
        <Typography variant="body2" color="text.secondary">
          {video.uploadedBy} · {relativeTime(video.createdAt)}
        </Typography>
      </Stack>
    </Container>
  )
}
