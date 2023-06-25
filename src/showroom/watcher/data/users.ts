import type WatcherData from '../core'

class Users extends Map<number, Watcher.User> {
  ctx: WatcherData
  constructor(ctx: WatcherData, users?: Watcher.User[]) {
    super(users?.map(i => [i.user_id, i]))
    this.ctx = ctx
  }

  add(user: Watcher.User) {
    if (!this.has(user.user_id)) {
      this.set(user.user_id, {
        avatar_url: user.avatar_url,
        user_id: user.user_id,
        name: user.name,
        point: user.point ? user.point : 0,
        image: user.image ? user.image : ''
      })
    }
    else {
      const u = this.get(user.user_id)
      if (!u) return
      u.avatar_url = user.avatar_url
      u.name = user.name
      u.point += user.point ? user.point : 0
      if (user?.image && user.image !== '') u.image = user.image
    }
  }

  toArray(): Watcher.User[] {
    return Array.from(this.values())
  }

  getAvatarId(str: string) {
    const matches = str.match(/avatar\/(\d+)\.png/)
    if (matches) {
      return parseInt(matches[1])
    }
    else {
      return 1
    }
  }
}

export default Users
