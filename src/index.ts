import 'dotenv/config'
import { Events } from 'discord.js'
import ShowroomWatcherManager from './showroom/watcherManager'
import client from './discordClient'

const showroomManager = new ShowroomWatcherManager()

client.login(process.env.DISCORD_TOKEN)

client.on(Events.ClientReady, () => {
  showroomManager.init()
})
