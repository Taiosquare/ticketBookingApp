const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const express = require("express");
const app = express();

let server = {};

const func = () => {
    console.log(`Worker ${process.pid} started`);

    require("./db/mongoose.js");

    const bodyParser = require("body-parser");
    const helmet = require("helmet");
    const compression = require("compression");
      
    const api = require("./api/api");
    const errorController = require("./api/controllers/system/error");

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
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, refresh-token");
        next();
    });

    app.use(api);

    app.use(errorController.get404);

    const config = require("../config");
  
    const server = app.listen(config.USERS_PORT);

    const io = require("./socket").init(server);

    io.on("connection", (socket) => {
        console.log(`Server running on port ${config.USERS_PORT}`);
    });
}

cluster.schedulingPolicy = cluster.SCHED_RR;

if (app.get('env') != 'test') {
    if (cluster.isMaster) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', function (worker, code, signal) {
            console.log('Worker %d died with code/signal %s. Restarting worker...', worker.process.pid, signal || code);
            cluster.fork();
        });

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {
        func();
    }
} else {
    func();
}

module.exports = { app, server };


