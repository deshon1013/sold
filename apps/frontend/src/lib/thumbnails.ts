import { apiPost } from './api'

/**
 * Fire-and-forget: asks the backend to generate a thumbnail server-side
 * (ffmpeg, in a Lambda) for a video the client couldn't capture one for
 * itself. Only confirms the request was accepted -- the thumbnail shows up
 * on the video whenever the worker finishes, not as part of this call.
 */
export async function requestServerThumbnail(videoId: string, videoUrl: string): Promise<void> {
  await apiPost('/api/thumbnails/generate', { videoId, videoUrl })
}
