import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { relativeTime } from '../../lib/relativeTime'
import type { Video } from '../../types/video'

interface VideoCardProps {
  video: Video
  onClick?: (video: Video) => void
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        onClick={() => onClick?.(video)}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        {video.thumbnailUrl ? (
          <CardMedia
            component="img"
            image={video.thumbnailUrl}
            alt=""
            sx={{ aspectRatio: '16 / 9' }}
          />
        ) : (
          <Box
            sx={{
              aspectRatio: '16 / 9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              color: 'text.disabled',
            }}
          >
            <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />
          </Box>
        )}

        <CardContent sx={{ flex: 1, width: '100%' }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 600,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            gutterBottom
          >
            {video.title}
          </Typography>

          <Chip label={video.gameTitle} size="small" variant="outlined" sx={{ mb: 1 }} />

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {video.uploadedBy} · {relativeTime(video.createdAt)}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{video.likeCount}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{video.commentCount}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
