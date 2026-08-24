import { supabase } from './supabase'

/** Whether the given user has already liked this video. */
export async function isVideoLikedByUser(videoId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('likes')
    .select('video_id')
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return !!data
}

/** RLS only allows a user to like as themselves. videos.like_count updates via trigger. */
export async function likeVideo(videoId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('likes').insert({ video_id: videoId, user_id: userId })
  if (error) throw new Error(error.message)
}

/** RLS only allows a user to remove their own like. videos.like_count updates via trigger. */
export async function unlikeVideo(videoId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('likes').delete().eq('video_id', videoId).eq('user_id', userId)
  if (error) throw new Error(error.message)
}
