import { CommandInteraction } from 'discord.js'

import { appText } from '../constant'

export default {
  data: {
    name: 'faq',
    description: 'よくある質問を表示する。'
  },
  async execute (interaction: CommandInteraction) {
    await interaction.reply({
      content: appText.faqMessage.get(),
      ephemeral: true
    })
  }
}
