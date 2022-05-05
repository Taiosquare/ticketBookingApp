const mongoose = require("mongoose");

const config = require("../../config");

mongoose.connect(config.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

module.exports = { mongoose };