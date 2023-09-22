import { Client, Events, GatewayIntentBits, Partials } from 'discord.js'
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ],
  partials: [Partials.Channel]
})

client.on(Events.ClientReady, () => {
  console.log('Bot online!')
})

export default client
