const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

moment.locale("pt-BR");
module.exports =  {
  name: "vip",
  description: "veja seu vip.",
  type: "CHAT_INPUT",
  

  run: async(client, interaction, args) => {

    let user = await client.db.users.findOne({ idU: interaction.user.id });
    let embed = new MessageEmbed();
    let button = {
      canal: new MessageButton(),
      cargo: new MessageButton(),
      reset: new MessageButton()
    };
    let action = new MessageActionRow();

    let canals;
    let cargos;
    let categorias;

    if (user.vip && user.vip.has) {
      if (user.vip.time <= Date.now()) return interaction.reply({ content: `Seu vip expirou, renove para continuar utilizando!`, ephemeral: true })

      if (!user.vip.canal) canals = "Nenhum", categorias = "Nenhum"
      else canals = `<#${client.channels.cache.get(user.vip.canal).id}>`, categorias = `${client.channels.cache.get(user.vip.canal).parent.name.toLowerCase()}`
      
      if (!user.vip.cargo) cargos = "Nenhum"
      else cargos = `<@&${client.guilds.cache.get(interaction.guild.id).roles.cache.get(user.vip.cargo).id}>`


      embed.setAuthor({ name: `${interaction.user.username} seu vip acaba em: ${moment(user.vip.time).format("ll")} às ${moment(user.vip.time).format("LT")}!`})
      embed.setDescription(`➔ **Canal:** ${canals}\n➔ **Cargo:** ${cargos}\n➔ **Categoria:** ${categorias}\n\n➔ **_Para adicionar sua tag basta usar /addvip._**\n➔ **_Para remover sua tag basta usar /rmvip._**`)
      embed.setColor("GREEN")
      embed.setFooter({ text: `${interaction.user.id}` })
      embed.setTimestamp(Date.now())
  
      button['canal'].setCustomId(`${canals == "Nenhum" ? "criar_canal" : "editar_canal"}`) && button['canal'].setStyle("PRIMARY") && button['canal'].setLabel(`${canals == "Nenhum" ? "Criar canal" : "Editar canal"}`)
      button['cargo'].setCustomId(`${cargos == "Nenhum" ? "criar_cargo" : "editar_cargo"}`) && button['cargo'].setStyle("PRIMARY") && button['cargo'].setLabel(`${cargos == "Nenhum" ? "Criar cargo" : "Editar cargo"}`)
      button['reset'].setCustomId("resetar") && button['reset'].setStyle("DANGER") && button['reset'].setLabel(`Resetar`)

      interaction.reply({ embeds: [embed], components: [action.setComponents([ button['canal'], button['cargo'], button['reset'] ])] })
    } else return interaction.reply({ content: "Você não possui vip!", ephemeral: true })
  }
}