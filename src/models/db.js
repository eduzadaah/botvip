const config = require("../../config.json");

require("mongoose").connect(config.mongodb)
.then(db => console.log(db.connection.name))
.catch(err => console.log(err))
