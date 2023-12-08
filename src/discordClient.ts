import { Client, Events, GatewayIntentBits, Partials } from 'discord.js'
import { logger } from './utils/logger'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.Channel],
})

client.on(Events.ClientReady, () => {
  logger.info('Bot online!')
})

export default client
