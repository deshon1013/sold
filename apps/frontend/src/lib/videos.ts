import { supabase } from './supabase'
import type { Video } from '../types/video'

// The FK constraint is named explicitly because the `likes` table (video_id
// -> videos, user_id -> profiles) makes PostgREST see an *implicit*
// many-to-many path between videos and profiles too -- without this hint it
// can't tell that apart from the direct uploader relationship below.
const VIDEO_SELECT = '*, profiles!videos_uploaded_by_fkey(name, avatar_url)'

interface VideoRow {
  id: string
  title: string
  game_title: string
  video_url: string
  thumbnail_url: string | null
  uploaded_by: string
  like_count: number
  comment_count: number
  created_at: string
  // A many-to-one embed (each video has exactly one uploader) -- PostgREST
  // returns this as a single object, not an array.
  profiles: { name: string; avatar_url: string | null } | null
}

function toVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    gameTitle: row.game_title,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    uploadedById: row.uploaded_by,
    uploadedBy: row.profiles?.name || 'Unknown',
    uploadedByAvatarUrl: row.profiles?.avatar_url ?? undefined,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
  }
}

export async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select(VIDEO_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as unknown as VideoRow[]).map(toVideo)
}

export async function fetchVideoById(id: string): Promise<Video | null> {
  const { data, error } = await supabase.from('videos').select(VIDEO_SELECT).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? toVideo(data as unknown as VideoRow) : null
}

export interface NewVideoInput {
  title: string
  gameTitle: string
  videoUrl: string
  thumbnailUrl?: string
  uploadedBy: string
}

export async function insertVideo(input: NewVideoInput): Promise<Video> {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      title: input.title,
      game_title: input.gameTitle,
      video_url: input.videoUrl,
      thumbnail_url: input.thumbnailUrl ?? null,
      uploaded_by: input.uploadedBy,
    })
    .select(VIDEO_SELECT)
    .single()
  if (error) throw new Error(error.message)
  return toVideo(data as unknown as VideoRow)
}

export interface VideoUpdateInput {
  title?: string
  gameTitle?: string
  thumbnailUrl?: string
}

/** RLS only allows this to succeed for the video's own uploader. */
export async function updateVideo(id: string, input: VideoUpdateInput): Promise<Video> {
  const { data, error } = await supabase
    .from('videos')
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.gameTitle !== undefined ? { game_title: input.gameTitle } : {}),
      ...(input.thumbnailUrl !== undefined ? { thumbnail_url: input.thumbnailUrl } : {}),
    })
    .eq('id', id)
    .select(VIDEO_SELECT)
    .single()
  if (error) throw new Error(error.message)
  return toVideo(data as unknown as VideoRow)
}

/** RLS only allows this to succeed for the video's own uploader. Doesn't touch R2 -- see deleteFile(). */
export async function deleteVideoRow(id: string): Promise<void> {
  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
