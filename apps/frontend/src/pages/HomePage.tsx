import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import { VideoGrid } from '../components/videos/VideoGrid'
import { fetchVideos } from '../lib/videos'
import type { Video } from '../types/video'

export function HomePage() {
  const navigate = useNavigate()
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
      .then(setVideos)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load videos'))
  }, [])

  return (
    <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {videos === null && !error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <VideoGrid videos={videos ?? []} onVideoClick={(video) => navigate(`/videos/${video.id}`)} />
      )}
    </Container>
  )
}
