import { readdir } from 'fs/promises'
import { join, parse } from 'path'

import {
  CategoryChannel,
  ChatInputApplicationCommandData,
  Client,
  ClientOptions,
  CommandInteraction,
  TextChannel,
  User
} from 'discord.js'

import { noop, sleep } from '../utils'

class Command {
  constructor (
    readonly data: ChatInputApplicationCommandData,
    readonly execute: (interaction: CommandInteraction) => Promise<void>
  ) {}
}

export class MyBot extends Client {
  readonly commands: Command[] = []

  constructor (options: ClientOptions, readonly authorId?: string) {
    super(options)
  }

  async loadCogs (): Promise<void> {
    const cogs = await readdir(join('src', 'cogs'))

    for (const cog of cogs) {
      const cogName = parse(cog).name

      await import(`../cogs/${cogName}`)
      console.log(`loaded ${cogName} cog`)
    }
  }

  async loadCommand (guildId: string): Promise<void> {
    const commandFiles = await readdir(join('src', 'commands'))

    commandFiles.map(async (file) => {
      const commandName = parse(file).name
      const command: Command = (await import(`../commands/${commandName}`)).default

      this.commands.push(new Command(command.data, command.execute))
    })

    this.once('ready', async () => {
      const data = this.commands.map((command) => command.data)

      await this.application?.commands.set(data, guildId)
      this.application?.commands.cache.forEach((command) =>
        console.log(`loaded ${command.name} command`)
      )
    })

    this.on('interactionCreate', async (interaction) => {
      if (!(interaction instanceof CommandInteraction)) return

      const command: Command | undefined = this.commands.find((command) =>
        interaction.command?.name === command.data.name
      )

      await command?.execute(interaction).catch(console.error)
    })
  }

  isAuthor (user: User): boolean {
    return user.id === this.authorId
  }

  isTextChannel = (channel: unknown): channel is TextChannel => {
    return channel instanceof TextChannel
  }

  getTextChannelById = (id: string): TextChannel => {
    const channel = this.channels.resolve(id)
    if (this.isTextChannel(channel)) {
      return channel
    }
    console.error(`channel ${id} is not found`)
    process.exit(1)
  }

  purgeCategory = async (category: CategoryChannel): Promise<void> => {
    category.children.forEach((channel) => {
      channel.delete().catch(noop)
    })
    await sleep(1000)
    await category.delete().catch(noop)
    // カテゴリーの削除を遅らせないと、Discord アプリ側で見え掛けだけのチャンネルが残る
  }
}
