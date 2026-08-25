import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { downloadObject, keyFromPublicUrl, publicUrlFor, uploadObject } from './lib/r2.js'
import { supabaseAdmin } from './lib/supabaseAdmin.js'

const execFileAsync = promisify(execFile)

interface ThumbnailJob {
  videoId: string
  videoUrl: string
  userId: string
}

function isThumbnailJob(value: unknown): value is ThumbnailJob {
  const job = value as Partial<ThumbnailJob>
  return typeof job.videoId === 'string' && typeof job.videoUrl === 'string' && typeof job.userId === 'string'
}

/**
 * Fallback thumbnail generation -- only reached when the browser's own
 * client-side capture (captureVideoFrame in the frontend) fails. Invoked
 * directly by BackendFunction via lambda:InvokeFunction (InvocationType:
 * 'Event', fire-and-forget), not over HTTP -- there's no caller waiting on
 * the result, so failures here only ever surface in CloudWatch.
 */
export async function handler(event: unknown): Promise<void> {
  if (!isThumbnailJob(event)) {
    console.error('Thumbnail job payload missing videoId/videoUrl/userId', event)
    return
  }
  const { videoId, videoUrl, userId } = event

  const videoKey = keyFromPublicUrl(videoUrl)
  if (!videoKey) {
    console.error('videoUrl is not one of our own R2 objects', videoUrl)
    return
  }

  const workDir = await mkdtemp(join(tmpdir(), 'thumb-'))
  try {
    const extension = videoKey.includes('.') ? videoKey.split('.').pop() : 'mp4'
    const inputPath = join(workDir, `input.${extension}`)
    const outputPath = join(workDir, 'thumb.jpg')

    const videoBytes = await downloadObject(videoKey)
    await writeFile(inputPath, videoBytes)

    await extractFrame(inputPath, outputPath)

    const thumbnailBytes = await readFile(outputPath)
    const thumbnailKey = `thumbnails/${userId}/${randomUUID()}.jpg`
    await uploadObject(thumbnailKey, thumbnailBytes, 'image/jpeg')

    // Guard against clobbering a thumbnail set some other way (e.g. the
    // uploader manually adding one) while this was still in flight.
    const { error } = await supabaseAdmin
      .from('videos')
      .update({ thumbnail_url: publicUrlFor(thumbnailKey) })
      .eq('id', videoId)
      .is('thumbnail_url', null)

    if (error) throw new Error(error.message)
  } catch (err) {
    console.error('Failed to generate server-side thumbnail', err)
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

/** Extracts one frame to `outputPath`. Tries 1s in first (avoids an all-black frame at time zero); falls back to 0s for very short clips. */
async function extractFrame(inputPath: string, outputPath: string): Promise<void> {
  for (const seekSeconds of [1, 0]) {
    try {
      await execFileAsync(ffmpegPath.path, [
        '-y',
        '-ss',
        String(seekSeconds),
        '-i',
        inputPath,
        '-frames:v',
        '1',
        '-q:v',
        '4',
        outputPath,
      ])
      return
    } catch (err) {
      if (seekSeconds === 0) throw err
      console.error(`ffmpeg failed seeking to ${seekSeconds}s, retrying at 0s`, err)
    }
  }
}
