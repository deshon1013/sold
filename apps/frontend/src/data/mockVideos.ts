import type { Video } from '../types/video'

// Placeholder data so the grid has something to lay out before real
// uploads exist. Remove once videos are fetched from Supabase.
const HOUR = 60 * 60 * 1000

type MockVideo = Omit<Video, 'createdAt'> & { hoursAgo: number }

const raw: MockVideo[] = [
  { id: '1', title: 'Clutch 1v4 on Bind', gameTitle: 'Valorant', uploadedBy: 'jmartinez', likeCount: 42, commentCount: 8, hoursAgo: 2 },
  { id: '2', title: 'Perfect no-scope across the map', gameTitle: 'Halo Infinite', uploadedBy: 'kayleen', likeCount: 19, commentCount: 3, hoursAgo: 5 },
  { id: '3', title: 'Malenia second phase finally down', gameTitle: 'Elden Ring', uploadedBy: 'dsantos', likeCount: 67, commentCount: 21, hoursAgo: 9 },
  { id: '4', title: 'Aerial double tap for the win', gameTitle: 'Rocket League', uploadedBy: 'brianng', likeCount: 31, commentCount: 6, hoursAgo: 14 },
  { id: '5', title: 'Solo carry vs a full team', gameTitle: 'Overwatch 2', uploadedBy: 'jmartinez', likeCount: 12, commentCount: 1, hoursAgo: 20 },
  { id: '6', title: 'Ranked promo match highlights', gameTitle: 'Apex Legends', uploadedBy: 'twoo', likeCount: 8, commentCount: 0, hoursAgo: 36 },
  { id: '7', title: 'Base fell but the redstone works', gameTitle: 'Minecraft', uploadedBy: 'kayleen', likeCount: 5, commentCount: 2, hoursAgo: 48 },
  { id: '8', title: 'Victory Royale with zero kills', gameTitle: 'Fortnite', uploadedBy: 'dsantos', likeCount: 23, commentCount: 9, hoursAgo: 60 },
  { id: '9', title: 'Ace on the pistol round', gameTitle: 'Valorant', uploadedBy: 'brianng', likeCount: 54, commentCount: 15, hoursAgo: 72 },
  { id: '10', title: 'Warthog jump gone wrong', gameTitle: 'Halo Infinite', uploadedBy: 'twoo', likeCount: 38, commentCount: 11, hoursAgo: 84 },
  { id: '11', title: 'First Malenia attempt, did not go well', gameTitle: 'Elden Ring', uploadedBy: 'jmartinez', likeCount: 29, commentCount: 7, hoursAgo: 96 },
  { id: '12', title: 'Ceiling shot from our own half', gameTitle: 'Rocket League', uploadedBy: 'kayleen', likeCount: 16, commentCount: 4, hoursAgo: 108 },
  { id: '13', title: 'Comeback from 0-3 down', gameTitle: 'Overwatch 2', uploadedBy: 'dsantos', likeCount: 44, commentCount: 12, hoursAgo: 120 },
  { id: '14', title: 'Third-partied at the worst moment', gameTitle: 'Apex Legends', uploadedBy: 'brianng', likeCount: 7, commentCount: 3, hoursAgo: 132 },
  { id: '15', title: 'Accidental creeper explosion tour', gameTitle: 'Minecraft', uploadedBy: 'twoo', likeCount: 21, commentCount: 5, hoursAgo: 144 },
  { id: '16', title: 'Storm chase to the final circle', gameTitle: 'Fortnite', uploadedBy: 'jmartinez', likeCount: 33, commentCount: 8, hoursAgo: 156 },
  { id: '17', title: 'Operator flick through smoke', gameTitle: 'Valorant', uploadedBy: 'kayleen', likeCount: 61, commentCount: 18, hoursAgo: 168 },
  { id: '18', title: 'Grapple-shot montage clip', gameTitle: 'Halo Infinite', uploadedBy: 'dsantos', likeCount: 14, commentCount: 2, hoursAgo: 180 },
  { id: '19', title: 'Boss rush, no deaths run', gameTitle: 'Elden Ring', uploadedBy: 'brianng', likeCount: 52, commentCount: 16, hoursAgo: 192 },
  { id: '20', title: 'Musty flick from spawn', gameTitle: 'Rocket League', uploadedBy: 'twoo', likeCount: 27, commentCount: 6, hoursAgo: 204 },
  { id: '21', title: 'Overtime team wipe', gameTitle: 'Overwatch 2', uploadedBy: 'jmartinez', likeCount: 18, commentCount: 4, hoursAgo: 216 },
  { id: '22', title: 'Ring closed and we were still looting', gameTitle: 'Apex Legends', uploadedBy: 'kayleen', likeCount: 9, commentCount: 1, hoursAgo: 228 },
  { id: '23', title: 'Speedrun attempt, new personal best', gameTitle: 'Minecraft', uploadedBy: 'dsantos', likeCount: 47, commentCount: 13, hoursAgo: 240 },
  { id: '24', title: 'Builder fight highlights reel', gameTitle: 'Fortnite', uploadedBy: 'brianng', likeCount: 25, commentCount: 7, hoursAgo: 252 },
  { id: '25', title: 'Wallbang double kill', gameTitle: 'Valorant', uploadedBy: 'twoo', likeCount: 36, commentCount: 10, hoursAgo: 264 },
  { id: '26', title: 'Sniper duel on the bridge', gameTitle: 'Halo Infinite', uploadedBy: 'jmartinez', likeCount: 20, commentCount: 5, hoursAgo: 276 },
]

export const mockVideos: Video[] = raw.map(({ hoursAgo, ...video }) => ({
  ...video,
  createdAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
}))
