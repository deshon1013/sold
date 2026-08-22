import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { createPresignedUploadUrl, publicUrlFor } from '../lib/r2.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const uploadsRouter = Router()

type UploadKind = 'video' | 'thumbnail' | 'avatar'

const CONTENT_TYPE_PATTERN: Record<UploadKind, RegExp> = {
  video: /^video\//,
  thumbnail: /^image\//,
  avatar: /^image\//,
}

interface PresignRequestBody {
  fileName?: string
  contentType?: string
  kind?: UploadKind
}

uploadsRouter.post('/presign', requireAuth, async (req, res) => {
  const { fileName, contentType, kind } = req.body as PresignRequestBody

  if (!fileName || !contentType || !kind || !(kind in CONTENT_TYPE_PATTERN)) {
    res.status(400).json({ error: 'fileName, contentType, and kind ("video" | "thumbnail" | "avatar") are required' })
    return
  }

  if (!CONTENT_TYPE_PATTERN[kind].test(contentType)) {
    res.status(400).json({ error: `contentType must be a ${kind === 'video' ? 'video/*' : 'image/*'} type` })
    return
  }

  const extension = fileName.includes('.') ? fileName.split('.').pop() : undefined
  const key = `${kind}s/${req.userId}/${randomUUID()}${extension ? `.${extension}` : ''}`

  try {
    const uploadUrl = await createPresignedUploadUrl(key, contentType)
    res.json({ uploadUrl, publicUrl: publicUrlFor(key), key })
  } catch (err) {
    console.error('Failed to create presigned upload URL', err)
    res.status(502).json({ error: 'Could not reach storage provider' })
  }
})
