import { apiDelete, apiPost } from './api'

type UploadKind = 'video' | 'thumbnail' | 'avatar'

interface PresignResponse {
  uploadUrl: string
  publicUrl: string
  key: string
}

/**
 * Gets a short-lived, scoped upload URL from the backend and PUTs the file
 * directly to R2 (the file never passes through our server). Returns the
 * file's permanent public URL.
 */
export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const { uploadUrl, publicUrl } = await apiPost<PresignResponse>('/api/uploads/presign', {
    fileName: file.name,
    contentType: file.type,
    kind,
  })

  const putResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!putResponse.ok) {
    throw new Error('Upload to storage failed. Please try again.')
  }

  return publicUrl
}

/** Deletes one of the caller's own files from R2 (an old avatar, a replaced thumbnail, a deleted video, ...). */
export async function deleteFile(url: string, kind: UploadKind): Promise<void> {
  await apiDelete('/api/uploads/file', { url, kind })
}
