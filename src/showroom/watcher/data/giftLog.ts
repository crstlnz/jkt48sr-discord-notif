import { getGiftLog } from '../../api'
import type WatcherData from '../core'
import { convertToMilliseconds } from '../../../utils'
import { sleep } from '../../../utils/sleep'

class GiftLog extends Array<ShowroomAPI.GiftLogItem> {
  ctx: WatcherData
  constructor(ctx: WatcherData, gift_log?: ShowroomAPI.GiftLogItem[]) {
    super(...(gift_log ?? []))
    this.ctx = ctx
  }

  async add(gift: ShowroomAPI.GiftLogItem) {
    this.push({ ...gift, created_at: convertToMilliseconds(gift.created_at) })
  }

  async fetch() {
    return await getGiftLog(this.ctx.id)
  }

  formatNumber(number: number): string {
    return number.toLocaleString('en-US')
  }

  getTop() {
    const userPoints = new Map<number, { point: number; name: string }>()
    let total = 0
    for (const { user_id, gift_id, num, name } of this) {
      const gift = this.ctx.giftList.get(gift_id)
      if (!gift || gift.free) continue
      total += gift.point * num
      userPoints.set(user_id, {
        point: (userPoints.get(user_id)?.point || 0) + gift.point * num,
        name
      })
    }
    const data = [...userPoints.values()].sort((a, b) => b.point - a.point).slice(0, 10)
    let user_string = [...data.entries()].reduce((a, [i, item]) => {
      a += `${i + 1}. ${item.name} : ${this.formatNumber(item.point)}G\n`
      return a
    }, '')
    if (userPoints.size > 10) user_string += 'and more...'
    return { total: `${this.formatNumber(total)}G`, users: user_string }
  }

  async update(after?: Date | string | number) {
    const date = after ? new Date(after) : null
    let data = await this.fetch().catch(e => console.log(e))
    if (!data) return
    if (date) data = data.filter(i => convertToMilliseconds(i.created_at) > date.getTime())
    for (const gift of data) {
      if (!this.some(i => i.num === gift.num && i.user_id === gift.user_id && convertToMilliseconds(i.created_at) === convertToMilliseconds(gift.created_at))) {
        this.add({ ...gift, created_at: convertToMilliseconds(gift.created_at) })
      }
    }
  }

  async getAllGifts(gifts: (ShowroomAPI.GiftLogItem & Pick<ShowroomAPI.Gift, 'free' | 'point' >)[] = [], unfetchedGifts?: ShowroomAPI.GiftLogItem[], retry = 0): Promise<(ShowroomAPI.GiftLogItem & Pick<ShowroomAPI.Gift, 'free' | 'point' >)[]> {
    const data = unfetchedGifts || this
    const missing = []
    for (const gift of data) {
      const giftData = this.ctx.giftList.get(gift.gift_id)
      if (giftData) {
        gifts.push({
          ...gift,
          free: giftData?.free ?? true,
          point: giftData?.point ?? 0
        })
      }
      else {
        missing.push(gift)
      }
    }

    if (missing.length) {
      console.log('Ada gift yang missing', missing)
      if (retry < 3) {
        await sleep(500)
        return await this.getAllGifts(gifts, missing, (retry + 1))
      }
      else {
        for (const gift of missing) {
          gifts.push({
            ...gift,
            free: true,
            point: 0
          })
        }
      }
    }
    return gifts
  }

  toArray(): ShowroomAPI.GiftLogItem[] {
    return [...this]
  }
}

export default GiftLog
