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

interface DeleteAvatarRequestBody {
  avatarUrl?: string
}

// Users only ever have one avatar -- the frontend calls this with the *previous*
// avatarUrl right after a new one is saved, so the old file doesn't just pile up.
uploadsRouter.delete('/avatar', requireAuth, async (req, res) => {
  const { avatarUrl } = req.body as DeleteAvatarRequestBody

  if (!avatarUrl) {
    res.status(400).json({ error: 'avatarUrl is required' })
    return
  }

  const key = keyFromPublicUrl(avatarUrl)

  // Scope check: only ever delete a file inside the caller's own avatar folder,
  // never anything else, however this endpoint gets called.
  if (!key || !key.startsWith(`avatars/${req.userId}/`)) {
    res.status(400).json({ error: 'avatarUrl is not a deletable object' })
    return
  }

  try {
    await deleteObject(key)
    res.status(204).end()
  } catch (err) {
    console.error('Failed to delete old avatar', err)
    res.status(502).json({ error: 'Could not reach storage provider' })
  }
})
