const { Schema, model } = require("mongoose");

const guildSchema = new Schema({
    idG: { type: String, required: true },
    vips: { type: Array, default: [] },
    perms: { type: Array, default: [] },
    tags: {
        has: { type: Boolean, default: false},
        canal: { type: String, default: null },
        disponiveis: { type: Array, default: [] }
    }
});

module.exports = model("guilds", guildSchema); 