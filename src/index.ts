import {
  appText,
  botAuthorId,
  discordBotToken,
  guildId
} from './constant'
import { MyBot } from './lib/discordBot'

const bot = new MyBot(
  {
    intents: 32767, // 32767 = (111111111111111)2
    partials: ['MESSAGE', 'USER']
  },
  botAuthorId
)

;(async () => {
  await bot.loadCogs()
  await bot.loadCommand(guildId)
  await bot.login(discordBotToken)
  console.log(appText.botLoggedIn.get(bot.user?.tag))
})().catch(console.error)

export const client = bot
