import type { EmbedBuilder } from 'discord.js'

interface ShowroomWatcherOptions {
  delay: {
    check_live: number
    check_live_maintenance: number
    update_message: number
  }
  socket: {
    timeout_refresh: number
    no_activity_refresh: number
  }
  discord: {
    channel: string
    dev_channel?: string
    specific_guilds?: string[]
  }
  message: {
    live: (watcher: WatcherData) => EmbedBuilder
    live_end: (watcher: WatcherData) => EmbedBuilder
  }
}
