import { apiPost } from './api'

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
export async function uploadFile(file: File, kind: 'video' | 'thumbnail'): Promise<string> {
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
