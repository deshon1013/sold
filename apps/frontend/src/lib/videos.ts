import { supabase } from './supabase'
import type { Video } from '../types/video'

interface VideoRow {
  id: string
  title: string
  game_title: string
  video_url: string
  thumbnail_url: string | null
  uploaded_by_name: string
  like_count: number
  comment_count: number
  created_at: string
}

function toVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    gameTitle: row.game_title,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    uploadedBy: row.uploaded_by_name,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
  }
}

export async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as VideoRow[]).map(toVideo)
}

export async function fetchVideoById(id: string): Promise<Video | null> {
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? toVideo(data as VideoRow) : null
}

export interface NewVideoInput {
  title: string
  gameTitle: string
  videoUrl: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedByName: string
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
      uploaded_by_name: input.uploadedByName,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toVideo(data as VideoRow)
}
