import { convertToMilliseconds } from '../../../utils'
import { getCommentLog } from '../../api'
import type WatcherData from '../core'

class Comments extends Array<Watcher.Comment> {
  ctx: WatcherData
  constructor(ctx: WatcherData, data?: Watcher.Comment[]) {
    super(...(data ?? []))
    this.ctx = ctx
  }

  add(data: Watcher.Comment) {
    this.push(data)
  }

  getTotalUsers(): number {
    const users = new Map()
    for (const comment of this) {
      users.set(comment.user_id, '')
    }

    return users.size
  }

  toArray(): Watcher.Comment[] {
    return [...this]
  }

  async update(after?: Date | string | number) {
    const date = after ? new Date(after) : null
    let data = await getCommentLog(this.ctx.id)
    if (!data) return
    if (date) data = data.filter(i => convertToMilliseconds(i.created_at) > date.getTime())
    for (const comment of data) {
      if (this.some(i => `${comment.comment}${comment.user_id}${comment.created_at}` === `${i.comment}${i.user_id}${i.created_at}`)) continue
      this.add({
        user_id: comment.user_id,
        avatar_id: comment.avatar_id,
        name: comment.name,
        comment: comment.comment,
        created_at: comment.created_at
      })
    }
  }
}

export default Comments
