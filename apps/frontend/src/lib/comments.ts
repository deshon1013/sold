import { supabase } from './supabase'
import type { Comment } from '../types/comment'

// The FK is named explicitly for the same reason as videos.ts's VIDEO_SELECT
// -- comments bridges videos and profiles too, so an unqualified embed risks
// becoming ambiguous the moment another junction table joins the two.
const COMMENT_SELECT = '*, profiles!comments_user_id_fkey(name, avatar_url)'

interface CommentRow {
  id: string
  video_id: string
  user_id: string
  parent_comment_id: string | null
  body: string
  created_at: string
  profiles: { name: string; avatar_url: string | null } | null
}

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    videoId: row.video_id,
    userId: row.user_id,
    userName: row.profiles?.name || 'Unknown',
    userAvatarUrl: row.profiles?.avatar_url ?? undefined,
    parentCommentId: row.parent_comment_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

export async function fetchComments(videoId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('video_id', videoId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as unknown as CommentRow[]).map(toComment)
}

export interface NewCommentInput {
  videoId: string
  userId: string
  body: string
  /** Omit (or null) for a top-level comment; pass a comment id to post a reply to it. */
  parentCommentId?: string | null
}

export async function insertComment(input: NewCommentInput): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      video_id: input.videoId,
      user_id: input.userId,
      body: input.body,
      parent_comment_id: input.parentCommentId ?? null,
    })
    .select(COMMENT_SELECT)
    .single()
  if (error) throw new Error(error.message)
  return toComment(data as unknown as CommentRow)
}
