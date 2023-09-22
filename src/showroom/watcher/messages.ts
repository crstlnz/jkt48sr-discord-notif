import type { BaseMessageOptions, MessageCreateOptions, MessagePayload } from 'discord.js'
import { Message, PermissionFlagsBits, TextChannel } from 'discord.js'
import { sleep } from '../../utils/sleep'
import client from '../../discordClient'
import type WatcherData from './core'
import config from '@/config'

const devGuilds = config.discord.specific_guilds || []
const channelName = config.discord.channel_name.toLowerCase()
class WatcherMessageManager {
  messages: SRMessage[]
  temp?: Watcher.Message[]
  ctx: WatcherData
  constructor(ctx: WatcherData, messages?: Watcher.Message[]) {
    this.messages = []
    this.temp = messages
    this.ctx = ctx
  }

  async init() {
    try {
      if (this.temp) {
        for (const msg of this.temp) {
          const message = await this.getMessage(msg.channelId, msg.messageId)
          if (message) this.messages.push(await new SRMessage(message.channel as TextChannel).init(message))
        }
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  async delete() {
    if (!this.messages?.length) return
    for (const msg of this.messages) msg.delete()
    this.messages = []
  }

  async send(
    options: string | MessagePayload | BaseMessageOptions): Promise<SRMessage[]> {
    const result: SRMessage[] = []
    if (!this.messages?.length) {
      const channels = this.getChannels()
      if (channels?.length) {
        channels.forEach(async (channel) => {
          const msg = await new SRMessage(channel).init(options)
          result.push(msg)
          this.messages.push(msg)
        })
      }
    }
    else {
      return await this.update(options)
    }
    return result
  }

  async update(options: string | MessagePayload | BaseMessageOptions): Promise<SRMessage[]> {
    if (!this.messages?.length) {
      return []
    }
    const result: SRMessage[] = []
    for (const msg of this.messages) {
      const message = await msg.update(options)
      if (message) result.push(message)
    }
    return result
  }

  async getMessage(channelId: string, messageId: string): Promise<Message | null> {
    try {
      const channel = await client.channels.fetch(channelId)
      if (channel?.isTextBased && channel instanceof TextChannel) return await channel.messages.fetch(messageId)

      return null
    }
    catch (e) {
      console.error('Fail fetching a message')
      console.error(e)
      return null
    }
  }

  getChannels(): TextChannel[] {
    if (!client.isReady) return []
    const cNames = process.env.NODE_ENV === 'development' ? `${channelName}-dev` : channelName
    const channels: TextChannel[] = []
    const guilds = client.guilds.cache

    for (const guild of guilds.values()) {
      if (devGuilds.length > 0 && !devGuilds.includes(guild.id)) continue
      const channel = guild.channels.cache.find(
        c =>
          c.name.toLowerCase() === cNames
      && c.isTextBased()
      && c instanceof TextChannel
      && (guild.members.me ? c.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages) : false)
      )

      if (channel) channels.push(channel as TextChannel)
    }
    return channels
  }
}

class SRMessage {
  channel: TextChannel
  message?: Message
  constructor(channel: TextChannel) {
    this.channel = channel
  }

  async init(options: string | MessagePayload | MessageCreateOptions | Message): Promise<SRMessage> {
    if (options instanceof Message) {
      this.message = options
      return this
    }

    try {
      this.message = await this.channel.send(options)
    }
    catch (e) {
      console.error(e)
    }
    return this
  }

  async update(options: string | MessagePayload | BaseMessageOptions) {
    if (!this.message || !this.message.editable) return await this.init(options)
    try {
      this.message = await this.message.edit(options)
    }
    catch (e) {
      return await this.init(options)
    }
  }

  async delete(retry = 30) {
    if (!this.message) return
    if (!this.message.deletable) return
    try {
      await this.message.delete()
    }
    catch (e) {
      console.error(e)
      await sleep(5000)
      if (retry > 0) await this.delete(retry - 1)
    }
  }
}

export default WatcherMessageManager
