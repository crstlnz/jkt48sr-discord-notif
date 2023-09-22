import config from '@/config'

class WatcherLoop {
  period: number
  loopInterval?: NodeJS.Timeout
  isActive: boolean
  loopExecute?: (loop: number) => Promise<boolean> | boolean
  constructor(interval = config.delay.update_message) {
    this.period = interval
    this.isActive = true
  }

  /**
   * @param {fn: (loop : number) => Promise<boolean> | boolean} fn Function that return boolean, if false stop the loop.
   */
  onLoop(fn: (loop: number) => Promise<boolean> | boolean) {
    this.loopExecute = fn
  }

  async execute(loop = 0) {
    this.stop()
    if (!this.isActive) return

    try {
      if (this.loopExecute) {
        const stop = !((await this.loopExecute(loop)) ?? true)
        if (stop) return
      }
    }
    catch (e) {
      console.error(e)
    }
    this.loopInterval = setTimeout(() => {
      this.execute(loop + 1)
    }, this.period)
  }

  stop() {
    if (this.loopInterval) clearTimeout(this.loopInterval)
  }
}

export default WatcherLoop
