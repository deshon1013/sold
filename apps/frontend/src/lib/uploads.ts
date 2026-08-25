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
 *
 * Uses XMLHttpRequest instead of fetch for the PUT specifically because
 * fetch has no upload progress events -- onProgress (0-1) is only ever
 * reported if the caller passes one, e.g. to drive a progress bar for large
 * video files.
 */
export async function uploadFile(file: File, kind: UploadKind, onProgress?: (fraction: number) => void): Promise<string> {
  const { uploadUrl, publicUrl } = await apiPost<PresignResponse>('/api/uploads/presign', {
    fileName: file.name,
    contentType: file.type,
    kind,
  })

  await putWithProgress(uploadUrl, file, onProgress)

  return publicUrl
}

function putWithProgress(url: string, file: File, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error('Upload to storage failed. Please try again.'))
      }
    }

    xhr.onerror = () => reject(new Error('Upload to storage failed. Please try again.'))

    xhr.send(file)
  })
}

/** Deletes one of the caller's own files from R2 (an old avatar, a replaced thumbnail, a deleted video, ...). */
export async function deleteFile(url: string, kind: UploadKind): Promise<void> {
  await apiDelete('/api/uploads/file', { url, kind })
}
