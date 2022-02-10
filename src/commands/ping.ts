import { CommandInteraction } from 'discord.js'

import { client } from '..'
import { appText } from '../constant'

export default {
  data: {
    name: 'ping',
    description: 'BOT がオンラインか確認する。'
  },
  async execute (interaction: CommandInteraction) {
    const latency = Math.round(client.ws.ping)
    await interaction.reply({
      content: appText.ping.get(latency.toString()),
      ephemeral: true
    })
  }
}
