import { client } from '..'

client.on('threadCreate', async (thread) => {
  if (thread.joined || !thread.joinable) return

  await thread.join()
})
