try { require("./non-existent") }
catch (error) { module.exports = error }
