const fs = require("node:fs");

//Carregar eventos
const loadEvents = async function (client) {
    const eventFiles = fs
    .readdirSync(`${process.cwd()}/src/events/`)
    .filter((file) => file.endsWith(".js"));
    
    for (const file of eventFiles) {
        const event = require(`../events/${file}`);
        
        if (event.name) {
            console.log(` ✅  | Evento ${file} carregado.`);
        } else {
            console.log(` ❌ | Evento ${file} falta um help.name ou help.name não está na string.`);
            continue;
        }
        
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client))
        
        }
    }
}

//Carregar slashcommands
const loadSlashCommands = async function (client) {
    let slash = []

    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
        const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
        
        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            
            if (command.name) {
                client.slash.set(command.name, command);
                slash.push(command)
                console.log(`✅  | slashcommand ${file} carregado.`);
            } else {
                console.log(`❌ | slashcommand ${file} falta um help.name ou help.name não está na string.`);
                continue;
            }
        }
    }
        
    client.on("ready", async() => {
        await client.application.commands.set(slash)
    })
}

module.exports = {
    loadEvents,
    loadSlashCommands
}


