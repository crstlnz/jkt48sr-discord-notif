import { getGiftList } from '../../api'

class GiftList extends Map<number, ShowroomAPI.Gift> {
  roomId: number
  constructor(roomId: number, gift_list?: ShowroomAPI.Gift[]) {
    super((gift_list ?? []).map(i => [i.gift_id, i]))
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
      console.error(e)
      return null
    })

    if (data) this.add(data)
  }

  getIds(): number[] {
    return [...this.values()].map(i => i.gift_id)
  }
}

export default GiftList
