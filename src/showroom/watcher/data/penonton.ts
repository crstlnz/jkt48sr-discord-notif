import { getPolling } from '../../api'

class Penonton implements Watcher.Penonton {
  history: Watcher.PenontonHistory[]
  peak: number
  room_id: number
  constructor(room_id: number, penonton?: Watcher.Penonton) {
    this.history = penonton?.history ?? []
    this.peak = penonton?.peak ?? 0
    this.room_id = room_id
  }

  add(viewers: number) {
    const last = this.history[this.history.length - 1]
    if (last && viewers === last.num) return
    this.peak = Math.max(this.peak, viewers)
    this.history.push({
      num: viewers,
      waktu: new Date()
    })
  }

  async fetch(): Promise<number | null> {
    const data = await getPolling(this.room_id)
    if ('online_user_num' in data) return data.online_user_num
    return null
  }

  async update() {
    const num = await this.fetch().catch(_ => null)
    if (num) this.add(num)
  }

  toJSON(): Watcher.Penonton {
    return {
      peak: this.peak,
      history: this.history
    }
  }
}

export default Penonton
