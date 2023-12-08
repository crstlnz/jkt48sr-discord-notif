import { Collection } from 'discord.js'
import { convertToMilliseconds } from '../../utils'
import { getLiveInfo, getOnlives, getRoomStatus } from '../api'
import Watcher from '../watcher'
import Loop from './loop'
import MessageManager from './messages'
import { logger } from '@/utils/logger'

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

  async preparePremiumWatcher(room: Watcher.Member, onliveData: ShowroomAPI.OnlivesRoom, host: string) {
    if (this.has(room.id)) return
    const data: Watcher.Data = {
      ...room,
      is_premium: true,
      image: onliveData.image.replace('_s', '_m'),
      live_type: onliveData.live_type,
      startedAt: convertToMilliseconds(onliveData.started_at),
      live_id: onliveData.live_id,
      socketData: {
        host,
        key: onliveData.bcsvr_key,
      },
      bg: 'https://static.showroom-live.com/image/room_background/default.png?v=1',
    }

    const watcher = this.createWatcher(data)
    await this.addWatcher(watcher)
  }

  async prepareWatcher(room: Watcher.Member) {
    if (this.has(room.id)) return
    const roomStatus = await getRoomStatus(room.roomKey)
    const live_info = await getLiveInfo(room.id)
    if (roomStatus.is_live) {
      logger.info(`Prepare room ${roomStatus.room_name}`)
      const data: Watcher.Data = {
        ...room,
        is_premium: live_info.premium_room_type !== 0,
        image: roomStatus.image_s.replace('_s', '_m'),
        live_type: roomStatus.live_type,
        startedAt: convertToMilliseconds(roomStatus.started_at),
        live_id: process.env.NODE_ENV === 'development' ? this.appendNumbers(48, roomStatus.live_id) : roomStatus.live_id,
        socketData: {
          host: roomStatus.broadcast_host,
          key: roomStatus.broadcast_key,
        },
        bg: roomStatus.background_image_url,
      }

      const watcher = this.createWatcher(data)
      await this.addWatcher(watcher)
    }
  }

  createWatcher(data: Watcher.Data): Watcher {
    const watcher = new Watcher(data)
    watcher.on('finish', async () => {
      logger.info(`Finish live : ${data.name}!`)
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
    logger.info(`Deleting ${watcher?.name} watcher!`)
    watcher.destroy()
    this.delete(id)
  }

  async init() {
    logger.info('Showroom Watcher starting...')
    this.loop.on('live', async (lives) => {
      for (const live of lives) {
        if (this.has(live.id)) continue
        try {
          await this.prepareWatcher(live)
        }
        catch (e) {
          logger.info(`Checking ${live.name} live is premium...`)
          try {
            const onlives = await getOnlives()
            const allLive = onlives.onlives.reduce<ShowroomAPI.OnlivesRoom[]>((a, b) => [...a, ...b.lives], [])
            const data = allLive.find(i => i.room_id === live.id)
            if (data?.premium_room_type === 1) {
              logger.info(`${live.name} live is premium!`)
              this.preparePremiumWatcher(live, data, onlives.bcsvr_host)
            }
          }
          catch (e) {
            logger.error(e)
          }
        }
      }

      for (const watcher of this.values()) {
        if (watcher.live_type !== 0) {
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
