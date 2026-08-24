import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const thumbnailsRouter = Router()

const lambda = new LambdaClient({})

interface GenerateThumbnailRequestBody {
  videoId?: string
  videoUrl?: string
}

// Fallback path: only called by the frontend when client-side capture
// (captureVideoFrame) fails. Fires the worker Lambda asynchronously and
// returns immediately -- the thumbnail shows up on the video whenever the
// worker finishes, not as part of this response.
thumbnailsRouter.post('/generate', requireAuth, async (req, res) => {
  const { videoId, videoUrl } = req.body as GenerateThumbnailRequestBody

  if (!videoId || !videoUrl) {
    res.status(400).json({ error: 'videoId and videoUrl are required' })
    return
  }

  const { data: video, error } = await supabaseAdmin.from('videos').select('uploaded_by').eq('id', videoId).maybeSingle()

  if (error) {
    console.error('Failed to look up video before generating thumbnail', error)
    res.status(502).json({ error: 'Could not verify video ownership' })
    return
  }

  // Same shape whether the video doesn't exist or just isn't the caller's --
  // no need to distinguish the two for someone probing IDs that aren't theirs.
  if (!video || video.uploaded_by !== req.userId) {
    res.status(404).json({ error: 'Video not found' })
    return
  }

  const functionName = process.env.THUMBNAIL_FUNCTION_NAME
  if (!functionName) {
    console.error('THUMBNAIL_FUNCTION_NAME is not configured')
    res.status(500).json({ error: 'Thumbnail generation is not configured' })
    return
  }

  try {
    await lambda.send(
      new InvokeCommand({
        FunctionName: functionName,
        InvocationType: 'Event',
        Payload: Buffer.from(JSON.stringify({ videoId, videoUrl, userId: req.userId })),
      }),
    )
    res.status(202).json({ accepted: true })
  } catch (err) {
    console.error('Failed to invoke thumbnail worker', err)
    res.status(502).json({ error: 'Could not start thumbnail generation' })
  }
})
