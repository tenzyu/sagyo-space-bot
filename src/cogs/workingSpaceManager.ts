import {
  CategoryChannel,
  Guild,
  TextChannel,
  VoiceChannel
} from 'discord.js'

import { client } from '..'
import { appText, channelCreateWorkingSpaceId } from '../constant'

const createWorkingSpace = async (guild: Guild): Promise<[CategoryChannel, TextChannel, VoiceChannel]> => {
  const newCategory = await guild.channels.create(
    '作業スペース', {
      type: 'GUILD_CATEGORY'
    }
  )
  const newText = await guild.channels.create(
    'no-mic', {
      type: 'GUILD_TEXT',
      parent: newCategory
    }
  )
  const newVoice = await guild.channels.create(
    'no title', {
      type: 'GUILD_VOICE',
      parent: newCategory
    }
  )
  return [newCategory, newText, newVoice]
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  const [oldChannel, newChannel] = [oldState.channel, newState.channel]

  if (oldChannel === newChannel) return

  const someoneInVoiceMaster =
    newState.member !== null &&
    newChannel?.id === channelCreateWorkingSpaceId

  const nobodyInWorkingSpace =
    oldChannel?.parent?.name === '作業スペース' &&
    oldChannel.members.size === 0

  if (someoneInVoiceMaster) {
    const member = newState.member
    const [category, text, voice] = await createWorkingSpace(newChannel.guild)

    await category.setPosition(1)

    // process involving a member
    await Promise.all([
      voice.permissionOverwrites.create(member, { MANAGE_CHANNELS: true }),
      newState.setChannel(voice),
      text.send(appText.guideNewWorkSpace.get(member.toString()))
    ]).catch(async () => await client.purgeCategory(category))
  }

  if (nobodyInWorkingSpace) {
    await client.purgeCategory(oldChannel.parent)
  }
})
