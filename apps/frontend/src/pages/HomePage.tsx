import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { VideoGrid } from '../components/videos/VideoGrid'
import { useSearch } from '../context/useSearch'
import { fetchVideos } from '../lib/videos'
import type { Video } from '../types/video'

export function HomePage() {
  const navigate = useNavigate()
  const { query } = useSearch()
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
      .then(setVideos)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load videos'))
  }, [])

  const filteredVideos = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return videos ?? []
    return (videos ?? []).filter(
      (video) => video.title.toLowerCase().includes(trimmed) || video.gameTitle.toLowerCase().includes(trimmed),
    )
  }, [videos, query])

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
      ) : filteredVideos.length === 0 && query.trim() ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
          No videos match "{query.trim()}"
        </Typography>
      ) : (
        <VideoGrid videos={filteredVideos} onVideoClick={(video) => navigate(`/videos/${video.id}`)} />
      )}
    </Container>
  )
}
