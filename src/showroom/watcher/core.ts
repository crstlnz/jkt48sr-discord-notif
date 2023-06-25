import EventEmitter from 'node:events'
import type { EmbedBuilder } from 'discord.js'
import type TypedEmitter from 'typed-emitter'
import config from '@root/src/config'
import GiftList from './data/giftList'
import GiftLog from './data/giftLog'
import Penonton from './data/penonton'
import Users from './data/users'
import WatcherLoop from './loop'
import WatcherMessageManager from './messages'
import WatcherSocket from './socket'
import Comments from './data/comments'
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WatcherEvents = {
  finish: () => void
  loop: () => void
}

const srIcon = 'https://res.cloudinary.com/haymzm4wp/image/upload/v1621609174/assets/showroom/sr_icon.png'
class WatcherData extends (EventEmitter as new () => TypedEmitter<WatcherEvents>) {
  id: number
  name: string
  image: string
  live_id: number
  bg: string
  roomKey: string
  socketData: { host: string; key: string }
  isActive: boolean
  giftList: GiftList
  giftLog: GiftLog
  penonton: Penonton
  live_type: number
  users: Users
  comments: Comments
  startedAt: Date
  isDev: boolean
  socket: WatcherSocket
  loop: WatcherLoop
  messages: WatcherMessageManager
  recordDates: Watcher.RecordDate[]
  recordAt: Date
  isSaving: boolean
  isSavingTemp: boolean
  constructor(data: Watcher.Data) {
    super()
    this.isDev = process.env.NODE_ENV === 'development'
    this.isActive = true
    this.isSaving = false
    this.isSavingTemp = false

    // data insert
    this.id = data.id // room_id
    this.name = data.name
    this.roomKey = data.roomKey
    this.live_id = data.live_id
    this.socketData = data.socketData
    this.live_type = data.live_type
    this.bg = data.bg
    this.image = data.image
    this.startedAt = new Date(data.startedAt ?? new Date())
    this.giftList = new GiftList(this.id, data.giftList)
    this.giftLog = new GiftLog(this, data.giftLog)
    this.penonton = new Penonton(this.id, data.penonton)
    this.users = new Users(this, data.users)
    this.recordDates = data.recordDates ?? []
    this.recordAt = new Date()
    this.socket = new WatcherSocket(data)
    this.loop = new WatcherLoop()
    this.comments = new Comments(this, data.comments)
    this.messages = new WatcherMessageManager(this, data.messages)
  }

  pushRecordDates() {
    this.recordDates.push({
      from: this.recordAt,
      to: new Date()
    })
  }

  generateMessage(): EmbedBuilder {
    return config.message.live(this)
  }

  generateFinishMessage() {
    return config.message.live_end(this)
  }

  destroy() {
    this.isActive = false
    this.loop.stop()
    this.socket.destroy()
  }
}

export default WatcherData
