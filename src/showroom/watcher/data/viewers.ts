import { getOnlives, getPolling } from '../../api'
import type WatcherData from '../core'

class Viewers implements Watcher.Viewers {
  peak: number
  last: number
  room_id: number
  ctx: WatcherData
  constructor(ctx: WatcherData, room_id: number, viewers?: Watcher.Viewers) {
    this.ctx = ctx
    this.peak = viewers?.peak ?? 0
    this.last = viewers?.last ?? 0
    this.room_id = room_id
  }

  async fetch(): Promise<number> {
    try {
      const data = await getPolling(this.room_id)
      if ('online_user_num' in data) return data.online_user_num
      throw new Error('Room is offline?')
    }
    catch (e) {
      if (this.ctx.is_premium) {
        return await this.getPremiumViewer()
      }
      throw e
    }
  }

  async getPremiumViewer(): Promise<number> {
    const onlives = await getOnlives()
    const allLives = onlives.onlives.reduce<ShowroomAPI.OnlivesRoom[]>((a, b) => {
      a.push(...b.lives)
      return a
    }, [])

    const live = allLives.find(i => i.room_id === this.room_id)
    if (live) {
      return live.view_num
    }
    else {
      return 0
    }
  }

  async update() {
    const num = await this.fetch().catch(_ => null)
    if (num == null) return
    if (num > this.peak) this.peak = num
    this.last = num
  }

  toJSON(): Watcher.Viewers {
    return {
      peak: this.peak,
      last: this.last,
    }
  }
}

export default Viewers
