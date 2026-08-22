/**
 * Captures a still frame from a local video file, entirely in the browser
 * (video + canvas, no backend involved) -- used as a default thumbnail when
 * the uploader doesn't pick one. Returns null (never throws) if capture
 * isn't possible for this file/browser, so callers can just fall back to no
 * thumbnail, same as if this didn't run at all.
 */
export async function captureVideoFrame(file: File): Promise<File | null> {
  const objectUrl = URL.createObjectURL(file)

  // iOS Safari refuses to decode video frames for a <video> that isn't
  // actually in the document -- mount it off-screen for the duration of the
  // capture rather than leaving it detached (which is fine on desktop
  // browsers, but silently produces a blank frame on iPhone).
  const video = document.createElement('video')
  video.style.position = 'fixed'
  video.style.top = '0'
  video.style.left = '0'
  video.style.width = '1px'
  video.style.height = '1px'
  video.style.opacity = '0'
  video.style.pointerEvents = 'none'
  document.body.appendChild(video)

  try {
    video.src = objectUrl
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    await new Promise<void>((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => resolve(), { once: true })
      video.addEventListener('error', () => reject(new Error('Could not read video metadata')), { once: true })
    })

    if (!Number.isFinite(video.duration) || video.duration <= 0) return null

    // A couple seconds in (or the midpoint of very short clips) tends to
    // avoid the black/blank frames some encoders put at time zero.
    const seekTo = Math.min(2, video.duration / 2)

    await new Promise<void>((resolve, reject) => {
      video.addEventListener('seeked', () => resolve(), { once: true })
      video.addEventListener('error', () => reject(new Error('Could not seek video')), { once: true })
      video.currentTime = seekTo
    })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    if (canvas.width === 0 || canvas.height === 0) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) return null

    return new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
  } catch (err) {
    console.error('Failed to capture a video frame for the thumbnail', err)
    return null
  } finally {
    video.remove()
    URL.revokeObjectURL(objectUrl)
  }
}
