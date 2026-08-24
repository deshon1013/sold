import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getInitials } from '../../lib/avatar'
import { relativeTime } from '../../lib/relativeTime'
import { SHADOW_TINT_DARK } from '../../theme'
import type { Video } from '../../types/video'

interface VideoCardProps {
  video: Video
  onClick?: (video: Video) => void
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <Card
      elevation={0}
      sx={(theme) => {
        const isDark = theme.palette.mode === 'dark'
        const tint = isDark ? SHADOW_TINT_DARK : '31, 35, 40'
        // A white glow reads far brighter/bigger than a charcoal one at the
        // same size -- dark mode gets a tighter, dimmer version.
        const boxShadow = isDark
          ? `0px 1px 3px rgba(${tint}, 0.05), 0px 4px 10px rgba(${tint}, 0.07)`
          : `0px 2px 6px rgba(${tint}, 0.12), 0px 10px 24px rgba(${tint}, 0.18)`
        const hoverBoxShadow = isDark
          ? `0px 2px 5px rgba(${tint}, 0.07), 0px 6px 14px rgba(${tint}, 0.1)`
          : `0px 4px 10px rgba(${tint}, 0.16), 0px 14px 30px rgba(${tint}, 0.24)`
        return {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow,
          transition: theme.transitions.create(['transform', 'box-shadow']),
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: hoverBoxShadow,
          },
        }
      }}
    >
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

          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1 }}>
            <Avatar src={video.uploadedByAvatarUrl} sx={{ width: 20, height: 20, fontSize: 10 }}>
              {getInitials(video.uploadedBy)}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {video.uploadedBy} · {relativeTime(video.createdAt)}
            </Typography>
          </Stack>

          {video.likeCount > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                {video.likeCount} {video.likeCount === 1 ? 'like' : 'likes'}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
