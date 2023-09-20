import { Collection } from 'discord.js'
import { convertToMilliseconds } from '../../utils'
import { getRoomStatus } from '../api'
import Watcher from '../watcher'
import Loop from './loop'
import MessageManager from './messages'
class ShowroomWatcherManager extends Collection<string | number, Watcher> {
  loop: Loop
  messages: MessageManager
  constructor() {
    super()
    this.loop = new Loop()
    this.messages = new MessageManager(this)
    this.messages.update()
  }

  appendNumbers(a: number, b: number): number {
    return +`${a}${b}`
  }

  async prepareWatcher(room: Watcher.Member) {
    if (this.has(room.id)) return
    const roomStatus = await getRoomStatus(room.roomKey)
    if (roomStatus.is_live) {
      console.log(`Prepare room ${roomStatus.room_name}`)
      const data: Watcher.Data = {
        ...room,
        image: roomStatus.image_s.replace('_s', '_m'),
        live_type: roomStatus.live_type,
        startedAt: convertToMilliseconds(roomStatus.started_at),
        live_id: process.env.NODE_ENV === 'development' ? this.appendNumbers(48, roomStatus.live_id) : roomStatus.live_id,
        socketData: {
          host: roomStatus.broadcast_host,
          key: roomStatus.broadcast_key
        },
        bg: roomStatus.background_image_url
      }

      const watcher = this.createWatcher(data)
      await this.addWatcher(watcher)
    }
  }

  createWatcher(data: Watcher.Data): Watcher {
    const watcher = new Watcher(data)
    watcher.on('finish', async () => {
      console.log(`Deleting ${data.name} watcher!`)
      this.deleteWatcher(data.id)
      await this.messages.finish(watcher).catch(console.error)
    })
    return watcher
  }

  async addWatcher(watcher: Watcher) {
    this.set(watcher.id, watcher)
    await watcher.init()
    this.messages.add(watcher)
  }

  deleteWatcher(data: Watcher | number) {
    const id = data instanceof Watcher ? data.id : data
    const watcher = this.get(id)
    if (!watcher) return
    watcher.destroy()
    this.delete(id)
  }

  async init() {
    console.log('Showroom Watcher starting...')
    this.loop.on('live', async (lives) => {
      for (const live of lives) {
        if (this.has(live.id)) continue
        try {
          await this.prepareWatcher(live)
        }
        catch (e) {
          console.error(e)
        }
      }

      for (const watcher of this.values()) {
        if (watcher.live_type !== 0) {
          console.log(`Live Type ${watcher.name} : ${watcher.live_type}`)
          const hasLive = lives.some(i => i.id === watcher.id)
          if (!hasLive) {
            watcher.finish()
          }
        }
      }
    })
    this.loop.init()
  }

  stop() {
    for (const watcher of this.values()) {
      watcher.destroy()
    }
    this.loop.stop()
  }
}

export default ShowroomWatcherManager
