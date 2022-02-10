import {
  TextChannel,
  GuildMember,
  MessageActionRow,
  MessageButton
} from 'discord.js'

import { client } from '..'
import { appText, channelCaptchaId, roleMembersId } from '../constant'
import { noop, sleep } from '../utils'

// ghost ping
let captchaChannel: TextChannel
client.once('ready', () => {
  captchaChannel = client.getTextChannelById(channelCaptchaId)
})

client.on('guildMemberAdd', async (member) => {
  await sleep(1000) // wait a sec for operation of roleManager

  if (member.roles.cache.has(roleMembersId)) return

  await captchaChannel
    .send(appText.ghostPingCaptcha.get(member.toString()))
    .then(async (m) => await m.delete())
    .catch(noop)
})

// create captcha panel
client.on('messageCreate', async (message) => {
  if (!client.isAuthor(message.author)) return
  if (!message.content.startsWith('?captcha')) return

  const registerButton = new MessageButton()
    .setCustomId('captcha')
    .setStyle('PRIMARY')
    .setLabel('認証する')
    .setEmoji('✅')

  await message.channel.send({
    content: appText.dialogCaptcha.get(),
    components: [new MessageActionRow().addComponents(registerButton)]
  })
})

client.on('interactionCreate', async (interaction) => {
  if (!(
    interaction.isButton() &&
    interaction.customId === 'captcha' &&
    interaction.member instanceof GuildMember
  )) return

  await interaction.member.roles.add(roleMembersId)
  await interaction.reply({
    content: appText.successCaptcha.get(),
    ephemeral: true
  })
})
