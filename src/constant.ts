import { join } from 'path'

import { config } from 'dotenv'
import Properties from 'use-properties'

config({ path: join(__dirname, '../.env') })

export const appText = new Properties('src/messages.properties')

export const discordBotToken = process.env.DISCORD_BOT_TOKEN
export const botAuthorId = '608242236546613259'

export const guildId = '921099960244650014'

export const channelCaptchaId = '937586625255469117'
export const channelCreateWorkingSpaceId = '936153011472990239'
export const channelRoleDataStoreId = '937009402991501392'
export const channelInactiveId = '936285817477926942'

export const roleWhileWorkingId = '936986878714974209'
export const roleMembersId = '937587092068917288'
export const roleUsersId = '921121459819126864'
export const roleBotsId = '921121504035500153'
