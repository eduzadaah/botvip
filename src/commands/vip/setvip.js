const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("ms");

module.exports =  {
  name: "setvip",
  description: "sete um vip.",
  type: "CHAT_INPUT",
  options: [
    {
        name: "membro",
        description: "mencione o membro que deseja setar vip.",
        required: true,
        type: "USER"
    }
  ],

  run: async(client, interaction, args) => {

    let guild = await client.db.guild.findOne({ idG: interaction.guild.id });
    if (!guild.perms.includes(interaction.user.id)) return interaction.reply({ content: "Você não possui permissão!", ephemeral: true });

    let user = interaction.options.getUser("membro");
    await client.db.users.findOneAndUpdate({ idU: user.id }, { $set: { "vip.has": true, "vip.time": Date.now() + ms("30d") } })

    if (guild.vips.length <= 0) return interaction.reply({ content: "O servidor não possui vip cadastrado!", ephemeral: true });

    let action = new MessageActionRow();

    guild.vips.forEach(vip => {
      action.addComponents(
        new MessageButton()
        .setCustomId(vip.nome)
        .setStyle("PRIMARY")
        .setLabel(vip.nome)
      )
    })

    await interaction.reply({ embeds: [new MessageEmbed().setDescription(`➔ **Lembre-se**: Uma vez que o vip é setado, somente os administradores com permissão ao bot poderão remover!`).setColor("BLUE").setFooter({ text: interaction.user.id + ", " + user.id }).setTimestamp(Date.now())], components: [action] })
  }
}