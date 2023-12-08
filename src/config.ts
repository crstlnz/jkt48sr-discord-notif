import { EmbedBuilder } from 'discord.js'
import type WatcherData from './showroom/watcher/core'
import type { ShowroomWatcherOptions } from './types/options'

const liveColor = '#2ddf58'
const finishColor = '#00b0f4'

const config: ShowroomWatcherOptions = {
  delay: {
    check_live: 20000,
    check_live_maintenance: 60000,
    update_message: 60000,
  },
  socket: {
    timeout_refresh: 6000,
    no_activity_refresh: 60000,
  },
  discord: {
    channel_name: 'sr-test', // if NODE_ENV=development channel name will be suffixed with "-dev"
    specific_guilds: [],
  },
  message: {
    live: (watcher: WatcherData): EmbedBuilder => {
      const giftData = watcher.giftLog.getTop()
      return new EmbedBuilder()
        .setTitle(watcher.name)
        .setDescription(`Total Gift : \`${giftData?.total ?? 0}\`\n\`\`\`${giftData?.users || 'No gift right now'}\`\`\``)
        .setImage(watcher.image)
        .setColor(liveColor)
        .setFooter({ text: 'Showroom Gift Counter', iconURL: 'https://play-lh.googleusercontent.com/AKKnVMfKzyuPK2QLY3WDhhfBKyhW8nq5KjYARLcDgcub4ue5B9RSBzjv4-nU5EA1debu' })
        .setURL(`https://www.showroom-live.com/${watcher.roomKey}`)
    },
    live_end: (watcher: WatcherData): EmbedBuilder => {
      const giftData = watcher.giftLog.getTop()
      return new EmbedBuilder()
        .setTitle(watcher.name)
        .setDescription(
          `Live ${watcher.name} is finished!` + `\nTotal Gifts : \`${giftData?.total ?? 0}\``,
        )
        .setImage(watcher.image)
        .setColor(finishColor)
        .setTimestamp(new Date().getTime())
        .setFooter({ text: 'Showroom', iconURL: 'https://play-lh.googleusercontent.com/AKKnVMfKzyuPK2QLY3WDhhfBKyhW8nq5KjYARLcDgcub4ue5B9RSBzjv4-nU5EA1debu' })
        .setURL(`https://www.showroom-live.com/${watcher.roomKey}`)
    },
  },

}

export default config
