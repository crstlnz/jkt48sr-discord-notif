const cookies = `sr_id=${process.env.SR_ID};`

export async function getLives(): Promise<ShowroomAPI.FollowOnlives> {
  const url = `https://www.showroom-live.com/api/follow/onlives?_=${new Date().getTime()}`
  const res = await fetch(url, { headers: { cookies } })
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  checkRoomsFollow(data?.room)
  return data
}

export async function getOnlives(): Promise<ShowroomAPI.Onlives> {
  const url = 'https://www.showroom-live.com/api/live/onlives'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getSchedules(): Promise<ShowroomAPI.FollowSchedules> {
  const url = 'https://www.showroom-live.com/api/follow/schedules'
  const res = await fetch(url, { headers: { cookies } })
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  checkRoomsFollow(data?.room)
  return data
}

export async function getSchedule(roomId: number | string): Promise<ShowroomAPI.NextLive> {
  const url = `https://www.showroom-live.com/api/room/next_live?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url, { headers: { cookies } })
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getIsLive(roomId: number | string): Promise<ShowroomAPI.IsLive> {
  const url = `https://www.showroom-live.com/room/is_live?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url, { headers: { cookies } })
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getLiveInfo(roomId: number | string): Promise<ShowroomAPI.LiveInfo> {
  const url = `https://www.showroom-live.com/api/live/live_info?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getProfile(roomId: number | string): Promise<ShowroomAPI.RoomProfile> {
  const url = `https://www.showroom-live.com/api/room/profile?room_id=${roomId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getRoomStatus(roomKey: string): Promise<ShowroomAPI.RoomStatus> {
  const url = `https://www.showroom-live.com/api/room/status?room_url_key=${roomKey}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getPolling(roomId: number): Promise<ShowroomAPI.Polling | ShowroomAPI.PollingLiveEnd> {
  const url = `https://www.showroom-live.com/api/live/polling?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  return data
}

export async function getGiftList(roomId: number): Promise<ShowroomAPI.Gift[]> {
  const url = `https://www.showroom-live.com/api/live/gift_list?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  if (!data?.normal) throw new Error('API changes error!')
  return data?.normal
}

export async function getGiftLog(roomId: number): Promise<ShowroomAPI.GiftLogItem[]> {
  const url = `https://www.showroom-live.com/api/live/gift_log?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  if (!data?.gift_log) throw new Error('API changes error!')
  return data?.gift_log ?? []
}

export async function getCommentLog(roomId: number): Promise<ShowroomAPI.Comment[]> {
  const url = `https://www.showroom-live.com/api/live/comment_log?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  if (!data?.comment_log) throw new Error('API changes error!')
  return data?.comment_log ?? []
}

export async function getStreamingURL(roomId: number): Promise<ShowroomAPI.StreamingURL[]> {
  const url = `https://www.showroom-live.com/api/live/streaming_url?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  if (!data?.streaming_url_list) throw new Error('API changes error!')
  return data?.streaming_url_list
}

export async function getStageList(roomId: number): Promise<Watcher.StageUser[]> {
  const url = `https://www.showroom-live.com/api/live/stage_user_list?room_id=${roomId}&_=${new Date().getTime()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  if (!data?.stage_user_list) throw new Error('API changes error!')
  return data?.stage_user_list
}

export async function getUserProfile(userId: number): Promise<ShowroomAPI.UserProfile> {
  const url = `https://www.showroom-live.com/api/user/profile?user_id=${userId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed!')
  const data = await res.json()
  if (!data) throw new Error('API changes error!')
  return data
}

function checkRoomsFollow(rooms: ShowroomAPI.RoomFollow[]) {
  if (rooms?.length && rooms[0] && !('has_next_live' in rooms[0] && 'room_name' in rooms[0] && 'room_id' in rooms[0])) console.warn('Follow Api changes in some fields')
}
