import type { ClientRequestArgs } from 'node:http'
import EventEmitter from 'node:events'
import type TypedEmitter from 'typed-emitter'
import WebSocket from 'ws'
import config from '@root/src/config'
import { getIsLive } from '../api'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WatcherSocketEvents = {
  comment: (comment: Watcher.Comment) => void
  gift: (gift: ShowroomAPI.GiftLogItem) => void
  finish: () => void
}

class WatcherSocket extends (EventEmitter as new () => TypedEmitter<WatcherSocketEvents>) {
  host: string
  key: string
  data: Watcher.Data
  options?: WebSocket.ClientOptions | ClientRequestArgs | undefined
  socket?: WebSocket
  activityTimeout?: NodeJS.Timeout
  pingTimeout?: NodeJS.Timeout
  pingAnswered?: boolean
  constructor(data: Watcher.Data, options?: WebSocket.ClientOptions | ClientRequestArgs | undefined) {
    super()
    this.host = data.socketData.host
    this.key = data.socketData.key
    this.data = data
    this.options = options
  }

  create() {
    this.refreshNoActivityTimeout()
    const socket = new WebSocket(`wss://${this.host}`, this.options)
    socket.on('open', () => {
      console.log(`${this.data.name} Socket Opened!`)
      this.remove()
      this.socket = socket
      this.socket.send(`SUB\t${this.key}`)
      this.pingSocket()
    })

    socket.on('message', (data) => {
      const message = String(data)
      try {
        if (message.startsWith('MSG')) {
          this.refreshNoMessageTimeout()
          const msg = message.split('\t')[2]
          if (!msg) return
          const json = JSON.parse(msg)
          const code = parseInt(json.t, 10)
          // detail number code on wlerin app : https://github.com/wlerin/showroom/blob/4f23efcc2329e3888e619251f8cdcd5c446850fe/showroom/comments.py
          switch (code) {
            case 1 :
              // comment
              // skip when user counting for 50 (for points)
              if (!Number.isNaN(json.cm) && parseInt(json.cm) <= 50) break
              this.emit('comment', {
                user_id: json.u,
                created_at: json.created_at,
                avatar_id: json.av,
                name: json.ac ?? '',
                comment: json.cm
              })
              break
            case 2:
              // gift
              this.emit('gift', {
                num: json.n,
                avatar_url: `https://image.showroom-cdn.com/showroom-prod/image/avatar/${json.av}.png`,
                name: json.ac ?? '',
                image: `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${json.g}_m.png`,
                gift_id: json.g,
                created_at: json.created_at,
                user_id: json.u,
                ua: json.ua,
                avatar_id: json.av,
                aft: json.aft,
                image2: ''
              })
              break
            case 101:
              // live end
              this.emit('finish')
              break
          }
        }
        else if (message.startsWith('ACK')) {
          this.pingAnswered = true
        }
      }
      catch (e) {
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') console.log('Error on message : ', e.message)
      }
    })

    socket.on('close', async (code, reason) => {
      if (code === 1000 && reason.toString() === 'Closing socket because destroy') return
      console.log(`${this.data.name} closed code : ${code}${reason ? `, Reason : ${reason}` : ''}!`)
      const isLive = await getIsLive(this.data.id)
      if (isLive?.ok) return this.refreshSocket()
      this.emit('finish')
    })

    socket.on('error', async (error) => {
      if (error.message !== 'Invalid WebSocket frame: invalid UTF-8 sequence') console.log('SOCKET ON ERROR', error)
    })

    socket.on('unexpected-response', () => {
      console.error('SOCKET UNEXPECTED RESPONSE')
    })

    socket.onerror = (error) => {
      console.error(error)
    }
  }

  remove() {
    try {
      this.destroy()
      this.socket = undefined
    }
    catch (e) {
      console.error(e)
    }
  }

  clearTimeout() {
    clearTimeout(this.activityTimeout)
    clearTimeout(this.pingTimeout)
  }

  async refreshSocket() {
    this.clearTimeout()
    this.destroy()
    this.create()
  }

  refreshNoMessageTimeout() {
    clearTimeout(this.activityTimeout)
    this.activityTimeout = setTimeout(() => {
      console.log(`${this.data?.name} no activity, refreshing socket...`)
      this.refreshSocket()
    }, config.socket.no_activity_refresh)
  }

  pingSocket() {
    clearTimeout(this.pingTimeout)
    this.pingAnswered = false
    this.socket?.send('PING')
    this.pingTimeout = setTimeout(() => {
      if (!this.pingAnswered) {
        console.log(`${this.data?.name} ping timeout, refreshing socket...`)
        this.refreshSocket()
        return
      }

      this.pingSocket()
    }, config.socket.timeout_refresh)
  }

  refreshNoActivityTimeout() {}

  destroy() {
    try {
      this.clearTimeout()
      this.socket?.removeAllListeners()
      this.socket?.close(1000, 'Closing socket because destroy')
      // this.socket?.terminate();
    }
    catch (e) {
      console.error(e)
    }
  }
}

export default WatcherSocket
