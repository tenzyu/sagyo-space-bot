import { GuildMember, PartialGuildMember } from 'discord.js'

import { client } from '..'
import { appText, roleUsersId as roleMembersId } from '../constant'
import { sleep } from '../utils'

const countMembers = (member: GuildMember | PartialGuildMember): number | undefined => {
  const role = member.guild.roles.cache.get(roleMembersId)
  return role?.members.size
}

const updateGuild = async (member: GuildMember | PartialGuildMember): Promise<void> => {
  await sleep(1000) // wait a sec for operation of roleManager

  const n = countMembers(member)
  if (n === undefined) return

  await member.guild.setName(appText.guildName.get(n.toString()))
}

client.on('guildMemberAdd', async (member) => await updateGuild(member))
client.on('guildMemberRemove', async (member) => await updateGuild(member))
