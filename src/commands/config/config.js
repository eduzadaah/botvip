

module.exports =  {
    name: "config",
    description: "Configure seu sistema vip.",
    type: "CHAT_INPUT",
    options: [
      {
        name: "vip",
        description: "Crie o nome do vip.",
        type: "STRING",
        required: true
      },
      {
        name: "duracao",
        description: "Escolha a duração do vip em dias.",
        type: "NUMBER",
        required: true
      },
      {
        name: "categoria",
        description: "Escolha a categoria do vip.",
        type: "CHANNEL",
        channel_types: [4],
        required: true
      },
      {
        name: "cargo",
        description: "Escolha o cargo que os vips serão criados abaixo.",
        type: "ROLE",
        required: true
      }
    ],
  
    run: async(client, interaction, args) => {
      let guild = await client.db.guild.findOne({ idG: interaction.guild.id });
      if (!guild.perms.includes(interaction.user.id)) return interaction.deferUpdate();

      let vip = interaction.options.getString("vip");
      let dura = interaction.options.getNumber("duracao");
      let categoria = interaction.options.getChannel("categoria");
      let cargo = interaction.options.getRole("cargo");

      if (categoria.type !== "GUILD_CATEGORY") return interaction.reply({ content: "A categoria seleciona não é categoria.", ephemeral: true });
      if (guild.vips.find(v => v.nome == vip)) return interaction.reply({ content: `Já existe um vip com este nome.`, ephemeral: true })
      
      await client.db.guild.findOneAndUpdate({ idG: interaction.guild.id }, { $push: { "vips": { nome: vip, duracao: dura, categoria: categoria.id, cargo: cargo.id }  } })
      return interaction.reply({ content: `**${vip}** criado com sucesso.`, ephemeral: true })
    }
  }