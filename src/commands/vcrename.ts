import {CommandInteraction, GuildMember, TextChannel} from 'discord.js'
import {SlashCommandBuilder} from '@discordjs/builders'

const data = new SlashCommandBuilder()
    .setName('vc')
    .setDescription('現在参加しているVCの名前を変更する')
    .addStringOption((option) =>
        option
            .setName('名前')
            .setDescription('設定する名前')
            .setRequired(true)
    )
    .toJSON();

export default {
  data: data,
  async execute(interaction: CommandInteraction) {
    const client = interaction.client;
    const name = interaction.options.getString('名前', true);
    if (!interaction.guildId) {
      await interaction.reply({
        content: "このコマンドはギルド外では実行できません。",
        ephemeral: true
      });
      return;
    }
    const member =
        interaction.member instanceof GuildMember
            ? interaction.member
            : await client
                .guilds
                .fetch(interaction.guildId)
                .then((g) => g.members.fetch(interaction.user.id));
    const vc = member.voice.channel
    if (!vc) {
      await interaction.reply({
        content: "VCに入っていないとこのコマンドは使えません。",
        ephemeral: true
      });
      return;
    }
    const permission = vc.permissionsFor(member);
    if (!permission.has('MANAGE_CHANNELS')) {
      await interaction.reply({
        content: "あなたに編集権限がないのでこのコマンドは使えません。",
        ephemeral: true
      });
      return;
    }
    try{
      await vc.edit({name: name});
      const text = vc.parent!.children
          .filter((c): c is TextChannel => c instanceof TextChannel)
          .first();
      await text?.edit({name: name});
    }
    catch (e){
      await interaction.reply({
        content: "リネームに失敗しました。"
      });
      console.error(e);
      return
    }
    await interaction.reply({
      content: `チャンネル名を\`${name}\`に変更しました。`
    })

  }

}
