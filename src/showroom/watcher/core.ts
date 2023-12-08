import EventEmitter from 'node:events'
import type { EmbedBuilder } from 'discord.js'
import type TypedEmitter from 'typed-emitter'
import GiftList from './data/giftList'
import GiftLog from './data/giftLog'
import Viewers from './data/viewers'
import Users from './data/users'
import WatcherLoop from './loop'
import WatcherMessageManager from './messages'
import WatcherSocket from './socket'
import Comments from './data/comments'
import config from '@/config'

// eslint-disable-next-line ts/consistent-type-definitions
type WatcherEvents = {
  finish: () => void
  loop: () => void
}

class WatcherData extends (EventEmitter as new () => TypedEmitter<WatcherEvents>) {
  id: number
  name: string
  image: string
  live_id: number
  bg: string
  roomKey: string
  socketData: { host: string, key: string }
  isActive: boolean
  giftList: GiftList
  giftLog: GiftLog
  penonton: Viewers
  live_type: number
  users: Users
  comments: Comments
  startedAt: Date
  isDev: boolean
  socket: WatcherSocket
  loop: WatcherLoop
  messages: WatcherMessageManager
  recordAt: Date
  is_premium: boolean
  constructor(data: Watcher.Data) {
    super()
    this.isDev = process.env.NODE_ENV === 'development'
    this.isActive = true
    // data insert
    this.is_premium = data.is_premium
    this.id = data.id // room_id
    this.name = data.name
    this.roomKey = data.roomKey
    this.live_id = data.live_id
    this.socketData = data.socketData
    this.live_type = data.live_type
    this.bg = data.bg
    this.image = data.image
    this.startedAt = new Date(data.startedAt ?? new Date())
    this.giftList = new GiftList(this, this.id, data.giftList)
    this.giftLog = new GiftLog(this, data.giftLog)
    this.penonton = new Viewers(this, this.id, data.penonton)
    this.users = new Users(this, data.users)
    this.recordAt = new Date()
    this.socket = new WatcherSocket(data)
    this.loop = new WatcherLoop()
    this.comments = new Comments(this, data.comments)
    this.messages = new WatcherMessageManager(this, data.messages)
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
