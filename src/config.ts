import { EmbedBuilder } from 'discord.js'
import type WatcherData from './showroom/watcher/core'
import type { ShowroomWatcherOptions } from './types/options'

const liveColor = '#2ddf58'
const finishColor = '#00b0f4'

const config: ShowroomWatcherOptions = {
  delay: {
    check_live: 20000,
    check_live_maintenance: 60000,
    update_message: 60000
  },
  socket: {
    timeout_refresh: 6000,
    no_activity_refresh: 60000
  },
  discord: {
    channel_name: 'showroom',
    specific_guilds: []
  },
  message: {
    live: (watcher: WatcherData): EmbedBuilder => {
      const giftData = watcher.giftLog.getTop()
      return new EmbedBuilder()
        .setTitle(watcher.name)
        .setDescription(`Total Gift : \`${giftData?.total ?? 0}\`\n\`\`\`${giftData?.users || 'No gift right now'}\`\`\``)
        .setImage(watcher.image)
        .setColor(liveColor)
        .setFooter({ text: 'Showroom Gift Counter', iconURL: 'https://www.showroom-live.com/favicon.ico' })
        .setURL(`https://www.showroom-live.com/${watcher.roomKey}`)
    },
    live_end: (watcher: WatcherData): EmbedBuilder => {
      const giftData = watcher.giftLog.getTop()
      return new EmbedBuilder()
        .setTitle(watcher.name)
        .setDescription(
          `Live ${watcher.name} telah selesai!` + `\nTotal Gifts : \`${giftData?.total ?? 0}\``
        )
        .setImage(watcher.image)
        .setColor(finishColor)
        .setTimestamp(new Date().getTime())
        .setFooter({ text: 'Showroom', iconURL: 'https://www.showroom-live.com/favicon.ico' })
        .setURL(`https://www.showroom-live.com/${watcher.roomKey}`)
    }
  }

}

export default config
