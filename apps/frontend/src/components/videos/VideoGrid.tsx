import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import { VideoCard } from './VideoCard'
import type { Video } from '../../types/video'

const PAGE_SIZE = 12 // 4 columns x 3 rows

interface VideoGridProps {
  videos: Video[]
  onVideoClick?: (video: Video) => void
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(videos.length / PAGE_SIZE))
  // videos changes wholesale on a new search/filter -- clamp rather than
  // risk landing on a now-empty page (e.g. filtering while on page 2).
  const safePage = Math.min(page, pageCount)

  const pageVideos = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return videos.slice(start, start + PAGE_SIZE)
  }, [videos, safePage])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={2}>
        {pageVideos.map((video) => (
          <Grid key={video.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <VideoCard video={video} onClick={onVideoClick} />
          </Grid>
        ))}
      </Grid>

      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={safePage}
          onChange={(_, value) => setPage(value)}
          sx={{ alignSelf: 'center' }}
        />
      )}
    </Box>
  )
}
