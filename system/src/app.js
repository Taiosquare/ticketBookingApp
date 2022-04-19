const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
// const api = require("./api/api");
const config = require("../../users/config");
// const errorController = require("./api/controllers/system/error");

app.use(helmet());
app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, refresh-token, token");
    next();
});

//app.use(api);

//app.use(errorController.get404);

server = app.listen(config.PORT);

const io = require("./socket").init(server);

io.on("connection", (socket) => {
    console.log(`Server running on port ${config.PORT}`);
});

module.exports = { app, server };





