const mongoose = require("mongoose");

const config = require("../../config");

mongoose.connect(config.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

module.exports = { mongoose };