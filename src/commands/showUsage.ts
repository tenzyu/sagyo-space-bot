import { CommandInteraction } from 'discord.js'

import { appText } from '../constant'

export default {
  data: {
    name: 'usage',
    description: 'このサーバーの使い方を表示する。'
  },
  async execute (interaction: CommandInteraction) {
    await interaction.reply({
      content: appText.helpMessage.get(),
      ephemeral: true
    })
  }
}
