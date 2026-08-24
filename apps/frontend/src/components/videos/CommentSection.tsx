import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../context/useAuth'
import { getInitials } from '../../lib/avatar'
import { fetchComments, insertComment } from '../../lib/comments'
import { relativeTime } from '../../lib/relativeTime'
import type { Comment } from '../../types/comment'

interface CommentSectionProps {
  videoId: string
  commentCount: number
  /** Called after a comment or reply successfully posts, so the caller can keep its own commentCount in sync. */
  onCommentPosted?: () => void
}

export function CommentSection({ videoId, commentCount, onCommentPosted }: CommentSectionProps) {
  const { user } = useAuth()

  const [comments, setComments] = useState<Comment[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [newBody, setNewBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [postingReply, setPostingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  useEffect(() => {
    fetchComments(videoId)
      .then(setComments)
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Could not load comments'))
  }, [videoId])

  // Newest top-level threads first; replies within a thread stay chronological.
  const topLevelComments = useMemo(
    () => (comments ?? []).filter((comment) => !comment.parentCommentId).slice().reverse(),
    [comments],
  )

  function repliesFor(commentId: string) {
    return (comments ?? []).filter((comment) => comment.parentCommentId === commentId)
  }

  function startReplyingTo(commentId: string) {
    setReplyingToId((current) => (current === commentId ? null : commentId))
    setReplyBody('')
    setReplyError(null)
  }

  async function handlePostComment(event: SubmitEvent) {
    event.preventDefault()
    if (!user) return
    const trimmed = newBody.trim()
    if (!trimmed) return

    setPostError(null)
    setPosting(true)
    try {
      const created = await insertComment({ videoId, userId: user.id, body: trimmed })
      setComments((prev) => [...(prev ?? []), created])
      setNewBody('')
      onCommentPosted?.()
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not post your comment.')
    } finally {
      setPosting(false)
    }
  }

  async function handlePostReply(parentCommentId: string) {
    if (!user) return
    const trimmed = replyBody.trim()
    if (!trimmed) return

    setReplyError(null)
    setPostingReply(true)
    try {
      const created = await insertComment({ videoId, userId: user.id, body: trimmed, parentCommentId })
      setComments((prev) => [...(prev ?? []), created])
      setReplyBody('')
      setReplyingToId(null)
      onCommentPosted?.()
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Could not post your reply.')
    } finally {
      setPostingReply(false)
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
        {commentCount} Comments
      </Typography>

      {user && (
        <Stack
          component="form"
          onSubmit={handlePostComment}
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', mb: 3 }}
        >
          <Avatar src={user.avatarUrl} sx={{ width: 32, height: 32, fontSize: 13 }}>
            {getInitials(user.name || user.email)}
          </Avatar>
          <Stack spacing={1} sx={{ flex: 1 }}>
            {postError && <Alert severity="error">{postError}</Alert>}
            <TextField
              value={newBody}
              onChange={(event) => setNewBody(event.target.value)}
              placeholder="Add a comment"
              size="small"
              fullWidth
              multiline
              minRows={1}
              disabled={posting}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={posting || !newBody.trim()}
              sx={{ alignSelf: 'flex-start' }}
            >
              {posting ? <CircularProgress size={18} color="inherit" /> : 'Comment'}
            </Button>
          </Stack>
        </Stack>
      )}

      {loadError && <Alert severity="error">{loadError}</Alert>}

      {comments === null && !loadError ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : topLevelComments.length === 0 && !loadError ? (
        <Typography color="text.secondary">No comments yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {topLevelComments.map((comment) => (
            <Box key={comment.id}>
              <CommentItem comment={comment} />

              {user && (
                <Button size="small" color="inherit" onClick={() => startReplyingTo(comment.id)} sx={{ ml: 6 }}>
                  Reply
                </Button>
              )}

              {replyingToId === comment.id && (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', ml: 6, mt: 1 }}>
                  <Avatar src={user?.avatarUrl} sx={{ width: 28, height: 28, fontSize: 12 }}>
                    {getInitials(user?.name || user?.email || '')}
                  </Avatar>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    {replyError && <Alert severity="error">{replyError}</Alert>}
                    <TextField
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      placeholder={`Reply to ${comment.userName}`}
                      size="small"
                      fullWidth
                      multiline
                      minRows={1}
                      disabled={postingReply}
                      autoFocus
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={postingReply || !replyBody.trim()}
                        onClick={() => handlePostReply(comment.id)}
                      >
                        {postingReply ? <CircularProgress size={16} color="inherit" /> : 'Reply'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        disabled={postingReply}
                        onClick={() => setReplyingToId(null)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}

              {repliesFor(comment.id).length > 0 && (
                <Stack spacing={2} sx={{ ml: 6, mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                  {repliesFor(comment.id).map((reply) => (
                    <CommentItem key={reply.id} comment={reply} avatarSize={28} />
                  ))}
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

function CommentItem({ comment, avatarSize = 36 }: { comment: Comment; avatarSize?: number }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Avatar src={comment.userAvatarUrl} sx={{ width: avatarSize, height: avatarSize, fontSize: avatarSize / 3 }}>
        {getInitials(comment.userName)}
      </Avatar>
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {comment.userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {relativeTime(comment.createdAt)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {comment.body}
        </Typography>
      </Box>
    </Stack>
  )
}
