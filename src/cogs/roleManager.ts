import {
  GuildMember,
  MessageAttachment,
  PartialGuildMember,
  TextChannel
} from 'discord.js'
import fetch from 'node-fetch'

import { client } from '..'
import {
  channelInactiveId,
  channelRoleDataStoreId,
  roleBotsId,
  roleUsersId,
  roleWhileWorkingId
} from '../constant'
import { arrayDiff } from '../utils'

class RoleData {
  data!: { [key: string]: string[] }
  store!: TextChannel
  ignoreRoleIds = [roleWhileWorkingId]

  commit (member: GuildMember | PartialGuildMember): string[] | null {
    const memberRoles = member.roles.cache
      .filter((role) => !this.ignoreRoleIds.includes(role.id))
      .map((role) => role.id)

    const diff = arrayDiff(this.data[member.id], memberRoles)
    if (diff.length === 0) {
      return null
    }

    this.data[member.id] = memberRoles
    return diff
  }

  async push (): Promise<void> {
    const json = JSON.stringify(this.data)
    const attachment = new MessageAttachment(Buffer.from(json), 'roles.json')
    await this.store.send({ files: [attachment] })
  }

  async pull (dataStoreChannel: TextChannel): Promise<this> {
    this.store = dataStoreChannel

    if (this.store.lastMessageId === null) {
      this.data = JSON.parse('{}')
      return this
    }

    const lastMessage = await this.store.messages.fetch(
      this.store.lastMessageId
    )
    const attachment = lastMessage.attachments.first()
    if (attachment === undefined) {
      this.data = JSON.parse('{}')
      return this
    }
    const dataUrl = attachment.url
    const response = await fetch(dataUrl)
    const bodyText = await response.text()
    this.data = JSON.parse(bodyText)
    return this
  }
}

let roleData: RoleData

client.on('ready', async () => {
  const roleDataStore = client.getTextChannelById(channelRoleDataStoreId)
  if (roleDataStore === null) {
    return
  }

  roleData = await new RoleData().pull(roleDataStore)
})

client.on('guildMemberAdd', async (member) => {
  // Revert roles to the last saved data
  const roles = roleData.data[member.user.id] ?? []
  await member.roles.set(roles)

  // Add role to recognize bots and users
  if (!member.roles.cache.hasAny(roleBotsId, roleUsersId)) {
    const role = member.user.bot ? roleBotsId : roleUsersId
    await member.roles.add(role)
  }
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const guildMemberRolesUpdate =
    newMember.roles.cache.size !== oldMember.roles.cache.size

  if (!guildMemberRolesUpdate) return

  const diff = roleData.commit(newMember)
  if (diff != null) {
    await roleData.push()
  }
})

// Add a spesific role while the member is in the voice channel except inactive channel
client.on('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.member
  if (member == null) return

  const [oldChannel, newChannel] = [oldState.channel, newState.channel]
  if (oldChannel === newChannel) return

  if (newChannel !== null && newChannel.id !== channelInactiveId) {
    await member.roles.add(roleWhileWorkingId)
  } else {
    await member.roles.remove(roleWhileWorkingId)
  }
})
