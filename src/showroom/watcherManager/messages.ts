import { sleep } from '../../utils/sleep'
import type Watcher from '../watcher'
import type ShowroomWatcherManager from '.'
class SRMessageManager {
  ctx: ShowroomWatcherManager
  loopInterval?: NodeJS.Timeout
  constructor(ctx: ShowroomWatcherManager) {
    this.ctx = ctx
  }

  async add(watcher: Watcher) {
    try {
      await watcher.messages.send({
        embeds: [watcher.generateMessage()]
      })
    }
    catch (e) {
      await sleep(1000)
      if (watcher.isActive) await this.add(watcher)
    }
  }

  async finish(watcher: Watcher) {
    for (const w of this.ctx.values()) {
      w.messages.delete().catch(e => console.error(e))
    }
    await watcher.messages.delete()
    await watcher.messages.send({ embeds: [watcher.generateFinishMessage()] })

    for (const w of this.ctx.values()) {
      await this.add(w)
    }
  }

  async update(loop = 1) {
    if (this.loopInterval) clearTimeout(this.loopInterval)
    for (const watcher of this.ctx.values()) {
      await watcher.messages.send({
        embeds: [watcher.generateMessage()]
      })
    }
    this.loopInterval = setTimeout(() => {
      this.update(loop + 1)
    }, 60000)
  }
}

export default SRMessageManager
