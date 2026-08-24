import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL

if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
  throw new Error(
    'Missing R2 env vars. Copy apps/backend/.env.example to apps/backend/.env.local and fill in ' +
      'R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.',
  )
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})

const PUBLIC_URL_BASE = publicUrl.replace(/\/+$/, '')

/** A short-lived URL the frontend can PUT the file to directly. */
export async function createPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  return getSignedUrl(r2, command, { expiresIn: 300 })
}

/** The permanent, public URL for an object once uploaded (bucket must have public access enabled). */
export function publicUrlFor(key: string): string {
  return `${PUBLIC_URL_BASE}/${key}`
}

/** The inverse of publicUrlFor -- recovers the object key from one of our own public URLs, or null if it isn't one. */
export function keyFromPublicUrl(url: string): string | null {
  if (!url.startsWith(`${PUBLIC_URL_BASE}/`)) return null
  return url.slice(PUBLIC_URL_BASE.length + 1)
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

/** Downloads an object's full contents -- used server-side (e.g. the thumbnail worker fetching a video to process). */
export async function downloadObject(key: string): Promise<Buffer> {
  const { Body } = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!Body) throw new Error(`R2 object has no body: ${key}`)
  const chunks: Buffer[] = []
  for await (const chunk of Body as AsyncIterable<Buffer>) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/** Uploads bytes directly (server-side only -- the client-facing path is the presigned URL above). */
export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await r2.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }))
}
