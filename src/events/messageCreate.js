const delay = new Set();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        let guild = await client.db.guild.findOne({ idG: message.guild.id });
        
        if (![message.channel.id].includes(guild.tags.canal)) return;
        else {
            if (guild.tags.has) {
                let escolhido = message.content;
                let tag = guild.tags.disponiveis;
                console.log(tag)
            } 

            //message.delete();
            //return message.channel.send(`Sistema de tags ainda não ativado!`)
        }
    }
}
