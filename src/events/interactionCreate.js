const { MessageButton, MessageEmbed, MessageActionRow } = require("discord.js");
const moment = require("moment");
const ms = require("ms");
require("moment-duration-format");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!await client.db.users.findOne({ idU: interaction.user.id })) await client.db.users.create({ idU: interaction.user.id });
        if (!await client.db.guild.findOne({ idG: interaction.guild.id })) await client.db.guild.create({ idG: interaction.guild.id });
        
        let guild = await client.db.guild.findOne({ idG: interaction.guild.id });
        let vip = guild.vips.find(x => x.nome === interaction.customId);

        if (interaction.isButton() && interaction.customId) {
            if (vip) {
                if (interaction.message.embeds[0].footer['text'].split(", ")[0] !== interaction.user.id) return interaction.deferUpdate(); 

                await interaction.guild.members.cache.get(interaction.message.embeds[0].footer['text'].split(", ")[1]).roles.add(vip.cargo);
                await client.db.users.findOneAndUpdate({ idU: interaction.message.embeds[0].footer['text'].split(", ")[1] }, { $set: { "vip.nome": vip.nome, "vip.has": true, "vip.time": Date.now() + ms(`${vip.duracao}d`) } });

                await interaction.message.edit({ content: `➔ O usuário recebeu o vip **${vip.nome}** com sucesso!`, embeds: [], components: [] })
                
                return;
            }
        
            
            if (interaction.message.embeds[0].footer['text'] !== interaction.user.id) return interaction.deferUpdate(); 

            let user = await client.db.users.findOne({ idU: interaction.user.id });
            let vips = await client.db.guild.findOne({ idG: interaction.guild.id });

            let embed = new MessageEmbed();
            let action = new MessageActionRow();
            let button = {
                canal: new MessageButton(),
                cargo: new MessageButton(),
                reset: new MessageButton(),

                nome: new MessageButton(),
                limite: new MessageButton(),
                cor: new MessageButton(),

                voltar: new MessageButton()
            };

            let canals;
            let cargos;
            let categorias;

            let refresh = async () => {
                user = await client.db.users.findOne({ idU: interaction.user.id });

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

                return embed && button;
            }
            
            switch (interaction.customId) {
                case 'criar_canal': {
                    interaction.deferUpdate();
                    vips = vips.vips.find(v => v.nome == user.vip.nome);

                    embed.setDescription("Aguarde, criando seu canal...");
                    embed.setColor("BLUE")

                    interaction.message.edit({ embeds: [embed], components: [] })
                    interaction.guild.channels.create(`${interaction.user.tag}`, { type: "GUILD_VOICE", parent: vips.categoria })
                    .then(async (canal) => {
                        await client.db.users.findOneAndUpdate({ idU: interaction.user.id }, { $set: { "vip.canal": canal.id }});
                        await refresh();

                        interaction.message.edit({ embeds: [embed], components: [action.setComponents([ button['canal'], button['cargo'], button['reset'] ])] })
                    })
                    .catch(e => {
                        embed.setDescription(`Não foi possível criar seu canal, use o comando novamente!`)
                        embed.setColor("RED")
                        embed.setFooter({ text: `${interaction.user.id}` })
                        embed.setTimestamp(Date.now())

                        interaction.message.edit({ embeds: embed, components: [] })
                    })
                    break;
                }

                case 'editar_canal': {
                    interaction.deferUpdate();
                    await refresh();

                    button['nome'].setCustomId("nome_canal") && button['nome'].setStyle("PRIMARY") && button['nome'].setLabel("Editar nome")
                    button['limite'].setCustomId("limite") && button['limite'].setStyle("PRIMARY") && button['limite'].setLabel("Editar limite")
                    button['voltar'].setCustomId("voltar") && button['voltar'].setStyle("DANGER") && button['voltar'].setLabel("Voltar")

                    let msg = await interaction.message.edit({ embeds: [embed], components: [action.setComponents([ button['nome'], button['limite'], button['voltar'] ])] })
                    let collector = await msg.channel.createMessageComponentCollector({ time: 30000 })

                    collector.on("collect", async (inter) => {
                        const f = () => interaction.user.id == inter.user.id;

                        if (inter.isButton()) {
                           switch (inter.customId) {
                            case 'nome_canal': {
                                inter.deferUpdate();

                                let m = await interaction.channel.send({ content: "Qual o novo nome do canal?" })   
                                let c = await m.channel.createMessageCollector({ filter: f, max: 1, time: 30000 })

                                c.on("collect", async (nome) => {
                                    nome.delete();
                                    m.delete();

                                    if (nome.content >= 30) return;
                                    await interaction.guild.channels.cache.get(user.vip.canal).setName(nome.content)
                                    await refresh();

                                    msg.edit({ embeds: [embed] })
                                });

                                break;
                            }

                            case 'limite': {
                                inter.deferUpdate();

                                let m = await interaction.channel.send({ content: "Qual o novo limite do canal?" })   
                                let c = await m.channel.createMessageCollector({ filter: f, max: 1, time: 30000 })

                                c.on("collect", async (limite) => {
                                    limite.delete();
                                    m.delete();

                                    if (isNaN(limite.content) || limite.content >= 99 || limite.content <= 0) return;
                                    await interaction.guild.channels.cache.get(user.vip.canal).setUserLimit(limite.content);
                                    
                                    await refresh();
                                    await msg.edit({ embeds: [embed] });
                                })

                                break;
                            }

                            case 'voltar': {
                                inter.deferUpdate();

                                await refresh();
                                await msg.edit({ embeds: [embed], components: [action.setComponents([ button['canal'], button['cargo'], button['reset'] ])] })
                            }
                           }
                        }
                    });

                    collector.on("end", async (i, reason) => {});
                    break;
                }

                case 'criar_cargo': {
                    interaction.deferUpdate();
                    await refresh();

                    let rr = await interaction.guild.roles.create({ 
                        data: { name: interaction.user.username, position: 10 }
                    })


                    break;
                }

                case 'editar_cargo': {
                    interaction.deferUpdate();
                    await refresh();

                    button['nome'].setCustomId("nome_cargo") && button['nome'].setStyle("PRIMARY") && button['nome'].setLabel("Editar nome")
                    button['cor'].setCustomId("cor") && button['cor'].setStyle("PRIMARY") && button['cor'].setLabel("Editar cor")
                    button['limite'].setCustomId("emoji") && button['limite'].setStyle("PRIMARY") && button['limite'].setLabel("Editar emoji") && button['limite'].setDisabled(interaction.guild.premiumSubscriptionCount < 7 ? true : false)
                    button['voltar'].setCustomId("voltar") && button['voltar'].setStyle("DANGER") && button['voltar'].setLabel("Voltar") 

                    let msg = await interaction.message.edit({ embeds: [embed], components: [action.setComponents([ button['nome'], button['cor'], button['limite'], button['voltar'] ])] })
                    let collector = await msg.channel.createMessageComponentCollector({ time: 30000 })

                    collector.on("collect", async (inter) => {
                        const f = () => interaction.user.id == inter.user.id;
                        const regexp = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");

                        if (inter.isButton()) {
                           switch (inter.customId) {
                            case 'nome_cargo': {
                                inter.deferUpdate();

                                let m = await interaction.channel.send({ content: "Qual o novo nome do cargo?" })   
                                let c = await m.channel.createMessageCollector({ filter: f, max: 1, time: 30000 })

                                c.on("collect", async (nome) => {
                                    nome.delete();
                                    m.delete();

                                    if (nome.content >= 30) return;
                                    await interaction.guild.roles.cache.get(user.vip.cargo).setName(nome.content)
                                    await refresh();

                                    msg.edit({ embeds: [embed] })
                                });

                                break;
                            }

                            
                            case 'cor': {
                                inter.deferUpdate();

                                let m = await interaction.channel.send({ content: "Qual a nova cor do cargo?" })   
                                let c = await m.channel.createMessageCollector({ filter: f, max: 1, time: 30000 })

                                c.on("collect", async (cor) => {
                                    cor.delete();
                                    m.delete();

                                    if (!regexp.test(cor.content)) return;
                                    await interaction.guild.roles.cache.get(user.vip.cargo).setColor(cor.content);
                                    
                                    await refresh();
                                    await msg.edit({ embeds: [embed] });
                                })

                                break;
                            }

                            case 'emoji': {
                                inter.deferUpdate();

                                let m = await interaction.channel.send({ content: "Qual o novo emoji do cargo?" })   
                                let c = await m.channel.createMessageCollector({ filter: f, max: 1, time: 30000 })

                                c.on("collect", async (emoji) => {
                                    emoji.delete();
                                    m.delete();

                                    let e = await emoji.guild.emojis.cache.first();
                                    if (!e) return;
                                    await interaction.guild.roles.cache.get(user.vip.cargo).setIcon(e.id);
                                    
                                    await refresh();
                                    await msg.edit({ embeds: [embed] });
                                })

                                break;
                            }

                            case 'voltar': {
                                inter.deferUpdate();

                                await refresh();
                                await msg.edit({ embeds: [embed], components: [action.setComponents([ button['canal'], button['cargo'], button['reset'] ])] })
                            
                                break;
                            }
                           }
                        }
                    });

                    collector.on("end", async (i, reason) => {});
                    break;
                }
            }
        } 

        if (!interaction.isCommand()) return;

        const command = client.slash.get(interaction.commandName);
        if (!command) return interaction.reply({ content: 'erro ao processar o comando' });
        
        if (command.ownerOnly) {
            if (interaction.user.id !== client.config.ownerID) {
                return interaction.reply({ content: "Você não ter permissão para usar esse comando.", ephemeral: true });
            }
        }
        
        const args = [];
        
        for (let option of interaction.options.data) {
            if (option.type === 'SUB_COMMAND') {
                if (option.name) args.push(option.name);
                option.options?.forEach(x => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        
        try {
            command.run(client, interaction, args)
        } catch (e) {
            interaction.reply({ content: e.message });
        }
    }
}
