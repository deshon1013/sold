export interface Comment {
  id: string
  videoId: string
  userId: string
  userName: string
  userAvatarUrl?: string
  /** null for a top-level comment, otherwise the id of the comment it's a reply to. */
  parentCommentId: string | null
  body: string
  createdAt: string
}
