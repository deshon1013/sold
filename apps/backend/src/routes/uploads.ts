import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { createPresignedUploadUrl, deleteObject, keyFromPublicUrl, publicUrlFor } from '../lib/r2.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const uploadsRouter = Router()

type UploadKind = 'video' | 'thumbnail' | 'avatar'

const CONTENT_TYPE_PATTERN: Record<UploadKind, RegExp> = {
  video: /^video\//,
  thumbnail: /^image\//,
  avatar: /^image\//,
}

function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === 'string' && value in CONTENT_TYPE_PATTERN
}

interface PresignRequestBody {
  fileName?: string
  contentType?: string
  kind?: UploadKind
}

uploadsRouter.post('/presign', requireAuth, async (req, res) => {
  const { fileName, contentType, kind } = req.body as PresignRequestBody

  if (!fileName || !contentType || !isUploadKind(kind)) {
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

interface DeleteFileRequestBody {
  url?: string
  kind?: UploadKind
}

// Deletes one of the caller's own files -- an old avatar being replaced, or a
// video/thumbnail being removed (edited out or the video itself deleted).
uploadsRouter.delete('/file', requireAuth, async (req, res) => {
  const { url, kind } = req.body as DeleteFileRequestBody

  if (!url || !isUploadKind(kind)) {
    res.status(400).json({ error: 'url and kind ("video" | "thumbnail" | "avatar") are required' })
    return
  }

  const key = keyFromPublicUrl(url)

  // Scope check: only ever delete a file inside the caller's own folder for
  // that kind, never anything else, however this endpoint gets called.
  if (!key || !key.startsWith(`${kind}s/${req.userId}/`)) {
    res.status(400).json({ error: 'url is not a deletable object' })
    return
  }

  try {
    await deleteObject(key)
    res.status(204).end()
  } catch (err) {
    console.error('Failed to delete file', err)
    res.status(502).json({ error: 'Could not reach storage provider' })
  }
})
