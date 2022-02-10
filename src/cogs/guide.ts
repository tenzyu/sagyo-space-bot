import { MessageActionRow, MessageButton } from 'discord.js'

import { client } from '..'
import { appText } from '../constant'
import { eq, _case } from '../utils'

client.on('messageCreate', async (message) => {
  if (!client.isAuthor(message.author)) return
  if (!message.content.startsWith('?guide')) return

  const helpButton = new MessageButton()
    .setCustomId('showUsage')
    .setStyle('PRIMARY')
    .setLabel('使い方, 仕組みを見る')
    .setEmoji('🔰')
  const FAQButton = new MessageButton()
    .setCustomId('showFAQ')
    .setStyle('PRIMARY')
    .setLabel('よくある質問を見る')
    .setEmoji('❓')
  const buttons = [helpButton, FAQButton]

  await message.channel.send({
    content: appText.dialogGuide.get(),
    components: [new MessageActionRow().addComponents(buttons)]
  })
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return

  const response = _case(interaction.customId)
    .when(eq('showUsage'), () => appText.helpMessage.get())
    .when(eq('showFAQ'), () => appText.faqMessage.get())
    .otherwise(() => undefined)

  if (response === undefined) return

  await interaction.reply({
    content: response,
    ephemeral: true
  })
})
