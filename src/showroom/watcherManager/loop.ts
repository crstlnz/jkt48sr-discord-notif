import EventEmitter from 'node:events'
import type TypedEmitter from 'typed-emitter'
import config from '@root/src/config'
import { getOnlives } from '../api'
import member from '../../assets/member.json'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ShowroomLoopEvents = {
  live: (lives: Watcher.Member[]) => void
}

class Loop extends (EventEmitter as new () => TypedEmitter<ShowroomLoopEvents>) {
  isMaintenance: boolean
  showroomList: Watcher.Member[]
  periodic: number
  periodicMT: number
  fail: number
  maxFail: number
  loopInterval?: NodeJS.Timeout
  isActive: boolean
  constructor() {
    super()
    this.showroomList = []
    this.periodic = config.delay.check_live // normal mode interval time
    this.periodicMT = config.delay.check_live_maintenance // maintenance mode interval time
    this.isMaintenance = false
    this.fail = 0 // fail count
    this.maxFail = 10 // max fail before it becomes maintenance mode
    this.isActive = true
  }

  get interval() {
    return this.isMaintenance ? this.periodicMT : this.periodic
  }

  async init() {
    await this.updateShowroomList()
    await this.execute()
  }

  getShowroomList(): Watcher.Member[] {
    return member as Watcher.Member[]
  }

  async updateShowroomList() {
    try {
      this.showroomList = this.getShowroomList()
      if (process.env.NODE_ENV === 'development') {
        const data = await getOnlives().catch(e => console.log(e))
        if (data != null) {
          const rooms = (data.onlives[0]?.lives ?? []).splice(0, 2)
          for (const room of rooms) {
            this.showroomList.push({
              name: room.main_name,
              id: room.room_id,
              roomKey: room.room_url_key,
              roomExists: true,
              isActive: true
            })
          }
        }
      }

      if (this.showroomList?.length <= 0) {
        console.log('Showroom List is empty!')
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  async execute(loop = 0) {
    if (this.loopInterval) clearTimeout(this.loopInterval)

    // FETCH
    try {
      await this.checkLive()
      this.success()
    }
    catch (e) {
      this.failed()
      console.log(e)
      console.log('Fail', this.fail)
      if (!this.isMaintenance) {
        return this.loopInterval = setTimeout(() => {
          if (this.isActive) this.execute(loop + 1)
        }, 5000)
      }
    }

    this.loopInterval = setTimeout(() => {
      if (this.isActive) this.execute(loop + 1)
    }, this.interval)
  }

  async checkLive() {
    // old api
    if (!this.showroomList.length) return
    const data = await getOnlives()
    const lives = new Map()
    for (const genre of data.onlives) {
      for (const live of genre.lives) {
        if (!lives.has(live.room_id)) lives.set(live.room_id, live)
      }
    }

    const result = this.showroomList.filter(room => lives.has(room.id) && room.isActive)
    if (result?.length) this.emit('live', result)
  }

  failed() {
    if (this.isMaintenance) return
    if (this.fail < 1) console.log('Showroom Timeout!')

    this.fail++
    if (this.fail > this.maxFail) {
      this.isMaintenance = true
      console.log('Showroom is under maintenance or down!')
    }
  }

  success() {
    this.fail = 0
    if (!this.isMaintenance) return
    this.isMaintenance = false
    console.log('Showroom is online!')
  }

  stop() {
    if (this.loopInterval) clearTimeout(this.loopInterval)
  }
}

export default Loop
