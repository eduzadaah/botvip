const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    idU: { type: String, required: true },
    vip: { 
        has: { type: Boolean, default: false },
        nome: { type: String, default: null },
        time: { type: Number, default: 0 },
        canal: { type: String, default: null }, // canal do usuario
        cargo: { type: String, default: null } // cargo do usuario
    }
});

module.exports = model("users", userSchema);