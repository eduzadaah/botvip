module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        client.user.setActivity(`eduzao`);
    
        console.log("Bot online!")
    }
}