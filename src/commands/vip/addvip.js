module.exports =  {
  name: "addvip",
  description: "Adicione seu vip a um usuário.",
  type: "CHAT_INPUT",
  options: [
    {
        name: "membro",
        description: "mencione o membro que deseja adicionar vip.",
        required: true,
        type: "USER"
    }
  ],

  run: async(client, interaction, args) => {
    let u = await client.db.users.findOne({ idU: interaction.user.id });
    if (!u.vip.has) return interaction.reply({ content: `Você não possui vip.`, ephemeral: true });
    if (!u.vip.cargo) return interaction.reply({ content: `Você deve configurar seu cargo vip antes.`, ephemeral: true });

    let user = interaction.options.getUser("membro");
    if (user.bot || user.system) return interaction.reply({ content: `Você não pode setar vip em bot.`, ephemeral: true });
    if (user.id == interaction.user.id) return interaction.reply({ content: `Você não pode setar vip em si mesmo.`, ephemeral: true });
    
    let member = await interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: `Este usuário não está no servidor.`, ephemeral: true });
    if (member.roles.cache.get(u.vip.cargo)) return interaction.reply({ content: `O usuário já possui sua tag vip.`, ephemeral: true });

    return interaction.reply({ content: `Vip adicionado com sucesso.`, ephemeral: true }) && interaction.guild.members.cache.get(user.id).roles.add(u.vip.cargo);
  }
}