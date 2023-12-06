const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("ms");

module.exports =  {
  name: "permadd",
  description: "sete permissao a um usuário.",
  type: "CHAT_INPUT",
  ownerOnly: true,
  options: [
    {
        name: "membro",
        description: "mencione o membro que deseja setar vip.",
        required: true,
        type: "USER"
    }
  ],

  run: async(client, interaction, args) => {
    let user = interaction.options.getUser("membro");

    await client.db.guild.findOneAndUpdate({ idG: interaction.guild.id }, { $push: { "perms": user.id } });
    interaction.reply({ content: `Permissão adicionada com sucesso!`, ephemeral: true });

  }
}