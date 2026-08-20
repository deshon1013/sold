export interface Video {
  id: string
  title: string
  gameTitle: string
  videoUrl: string
  createdAt: string
  uploadedBy: string
  likeCount: number
  commentCount: number
  thumbnailUrl?: string
}
