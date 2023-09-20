import WatcherData from './core'

class Watcher extends WatcherData {
  constructor(data: Watcher.Data) {
    super(data)
  }

  async init() {
    await this.giftList.update().catch(console.error)
    await this.giftLog.update().catch(console.error)
    await this.comments.update().catch(console.error)
    await this.messages.init().catch(console.error)
    this.socket.create()
    this.socket.on('finish', () => {
      this.finish()
    })
    this.socket.on('gift', (gift) => {
      this.giftLog.add(gift)
    })

    this.socket.on('comment', (comment) => {
      this.comments.add(comment)
    })

    this.loop.onLoop(async (loop) => {
      if (loop % 10 === 0) await this.giftList.update().catch(console.error)
      await this.penonton.update().catch(console.error)
      if (this.isActive) return true
      return false
    })
    this.loop.execute()
  }

  async finish() {
    this.destroy()
    this.emit('finish')
  }
}

export default Watcher
