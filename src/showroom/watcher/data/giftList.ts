import { getGiftList } from '../../api'
import type WatcherData from '../core'

class GiftList extends Map<number, ShowroomAPI.Gift> {
  roomId: number
  ctx: WatcherData
  constructor(ctx: WatcherData, roomId: number, gift_list?: ShowroomAPI.Gift[]) {
    super((gift_list ?? []).map(i => [i.gift_id, i]))
    this.ctx = ctx
    this.roomId = roomId
  }

  toArray(): ShowroomAPI.Gift[] {
    return Array.from(this.values())
  }

  add(gift_list: ShowroomAPI.Gift[]) {
    for (const gift of gift_list) this.set(gift.gift_id, gift)
  }

  async update() {
    const data = await getGiftList(this.roomId).catch((e) => {
      if (!this.ctx.is_premium) { console.error(e) }
      return null
    })

    if (data) this.add(data)
  }

  getIds(): number[] {
    return [...this.values()].map(i => i.gift_id)
  }
}

export default GiftList
