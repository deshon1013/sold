import { useState } from 'react'
import type { ChangeEvent, SubmitEvent } from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactPlayer from 'react-player'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { CommentSection } from '../components/videos/CommentSection'
import { useAuth } from '../context/useAuth'
import { getInitials } from '../lib/avatar'
import { isVideoLikedByUser, likeVideo, unlikeVideo } from '../lib/likes'
import { relativeTime } from '../lib/relativeTime'
import { deleteFile, uploadFile } from '../lib/uploads'
import { deleteVideoRow, fetchVideoById, updateVideo } from '../lib/videos'
import type { Video } from '../types/video'

// Below this length, a description already fits comfortably in ~3 lines --
// no point showing a "Show more" toggle that would have nothing to expand.
const DESCRIPTION_COLLAPSE_THRESHOLD = 200

export function VideoPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  // key={id} forces a fresh mount (and thus fresh state) whenever the route param changes.
  return <VideoPageContent key={id} id={id} />
}

function VideoPageContent({ id }: { id: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDarkMode = useTheme().palette.mode === 'dark'

  // undefined = still loading, null = fetched but not found
  const [video, setVideo] = useState<Video | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editGameTitle, setEditGameTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [liked, setLiked] = useState(false)
  const [likePending, setLikePending] = useState(false)

  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  useEffect(() => {
    fetchVideoById(id)
      .then(setVideo)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load video'))
  }, [id])

  useEffect(() => {
    if (!user) return
    isVideoLikedByUser(id, user.id)
      .then(setLiked)
      .catch((err: unknown) => console.error('Failed to check like status', err))
  }, [id, user])

  if (error) {
    return (
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        <PageBreadcrumbs current="Video" />
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
        <PageBreadcrumbs current="Video not found" />
        <Alert severity="warning">That video doesn't exist, or was deleted.</Alert>
      </Container>
    )
  }

  const isOwner = user?.id === video.uploadedById

  function startEditing() {
    if (!video) return
    setEditTitle(video.title)
    setEditGameTitle(video.gameTitle)
    setEditDescription(video.description ?? '')
    setPendingThumbnailFile(null)
    setThumbnailPreviewUrl(null)
    setEditError(null)
    setEditing(true)
  }

  function cancelEditing() {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl)
    setPendingThumbnailFile(null)
    setThumbnailPreviewUrl(null)
    setEditError(null)
    setEditing(false)
  }

  function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl)
    setPendingThumbnailFile(file)
    setThumbnailPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSaveEdit(event: SubmitEvent) {
    event.preventDefault()
    if (!video) return

    const trimmedTitle = editTitle.trim()
    const trimmedGameTitle = editGameTitle.trim()
    if (!trimmedTitle || !trimmedGameTitle) {
      setEditError('Title and game title are required')
      return
    }

    setEditError(null)
    setSavingEdit(true)
    try {
      const previousThumbnailUrl = video.thumbnailUrl
      const thumbnailUrl = pendingThumbnailFile ? await uploadFile(pendingThumbnailFile, 'thumbnail') : undefined

      const updated = await updateVideo(video.id, {
        title: trimmedTitle,
        gameTitle: trimmedGameTitle,
        description: editDescription.trim(),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      })

      // Replacing a thumbnail leaves the old one behind otherwise -- best-effort cleanup.
      if (thumbnailUrl && previousThumbnailUrl) {
        deleteFile(previousThumbnailUrl, 'thumbnail').catch((err: unknown) => {
          console.error('Failed to delete previous thumbnail', err)
        })
      }

      setVideo(updated)
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl)
      setThumbnailPreviewUrl(null)
      setPendingThumbnailFile(null)
      setEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not save changes.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete() {
    if (!video) return
    setDeleteError(null)
    setDeleting(true)
    try {
      // Best-effort: the video disappearing from the app matters more than
      // guaranteeing the R2 files are gone in the same instant.
      await deleteFile(video.videoUrl, 'video').catch((err: unknown) => {
        console.error('Failed to delete video file', err)
      })
      if (video.thumbnailUrl) {
        await deleteFile(video.thumbnailUrl, 'thumbnail').catch((err: unknown) => {
          console.error('Failed to delete thumbnail file', err)
        })
      }
      await deleteVideoRow(video.id)
      navigate('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete this video.')
      setDeleting(false)
    }
  }

  async function handleToggleLike() {
    if (!video || !user || likePending) return
    const wasLiked = liked
    const likedVideo = video

    // Optimistic update -- reverted below if the request fails.
    setLiked(!wasLiked)
    setVideo({ ...likedVideo, likeCount: likedVideo.likeCount + (wasLiked ? -1 : 1) })
    setLikePending(true)
    try {
      if (wasLiked) {
        await unlikeVideo(likedVideo.id, user.id)
      } else {
        await likeVideo(likedVideo.id, user.id)
      }
    } catch (err) {
      setLiked(wasLiked)
      setVideo(likedVideo)
      console.error('Failed to toggle like', err)
    } finally {
      setLikePending(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
      <PageBreadcrumbs current={video.title} />
      <Box sx={{ aspectRatio: '16 / 9', bgcolor: 'common.black', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
        <ReactPlayer src={video.videoUrl} controls width="100%" height="100%" />
      </Box>

      {editing ? (
        <Stack component="form" onSubmit={handleSaveEdit} noValidate spacing={2} sx={{ maxWidth: 480 }}>
          {editError && <Alert severity="error">{editError}</Alert>}

          <TextField
            label="Title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            disabled={savingEdit}
            fullWidth
            required
          />

          <TextField
            label="Game title"
            value={editGameTitle}
            onChange={(event) => setEditGameTitle(event.target.value)}
            disabled={savingEdit}
            fullWidth
            required
          />

          <TextField
            label="Description (optional)"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            disabled={savingEdit}
            fullWidth
            multiline
            minRows={3}
          />

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 96,
                aspectRatio: '16 / 9',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                flexShrink: 0,
              }}
            >
              {(thumbnailPreviewUrl ?? video.thumbnailUrl) && (
                <Box
                  component="img"
                  src={thumbnailPreviewUrl ?? video.thumbnailUrl}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </Box>
            <Button
              component="label"
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<PhotoCameraOutlinedIcon />}
              disabled={savingEdit}
            >
              Change thumbnail
              <input type="file" accept="image/*" hidden onChange={handleThumbnailChange} />
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained" disabled={savingEdit}>
              {savingEdit ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
            </Button>
            <Button variant="outlined" color="inherit" onClick={cancelEditing} disabled={savingEdit}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                {video.title}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleToggleLike}
                disabled={likePending}
                startIcon={
                  liked ? <ThumbUpIcon fontSize="small" color="primary" /> : <ThumbUpOutlinedIcon fontSize="small" />
                }
              >
                {video.likeCount}
              </Button>
            </Stack>

            {isOwner && (
              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" aria-label="Edit video" onClick={startEditing} sx={{ color: 'text.primary' }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    aria-label="Delete video"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
            <Chip label={video.gameTitle} size="small" variant="outlined" />
            <Avatar src={video.uploadedByAvatarUrl} sx={{ width: 22, height: 22, fontSize: 11 }}>
              {getInitials(video.uploadedBy)}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {video.uploadedBy} · {relativeTime(video.createdAt)}
            </Typography>
          </Stack>

          {video.description && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  ...(!descriptionExpanded && video.description.length > DESCRIPTION_COLLAPSE_THRESHOLD
                    ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }
                    : {}),
                }}
              >
                {video.description}
              </Typography>
              {video.description.length > DESCRIPTION_COLLAPSE_THRESHOLD && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setDescriptionExpanded((prev) => !prev)}
                  sx={{ mt: 0.5, px: 0, minWidth: 0 }}
                >
                  {descriptionExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <CommentSection
        videoId={video.id}
        commentCount={video.commentCount}
        onCommentPosted={() => setVideo((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current))}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete this video?</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>This can't be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={isDarkMode ? 'outlined' : 'contained'}
            color={isDarkMode ? 'inherit' : undefined}
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={
              isDarkMode
                ? {
                    color: '#ffffff',
                    borderColor: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                    },
                  }
                : {
                    bgcolor: '#ffffff',
                    color: '#000000',
                    border: '1px solid #000000',
                    '&:hover': {
                      bgcolor: '#f2f2f2',
                      border: '1px solid #000000',
                    },
                  }
            }
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
