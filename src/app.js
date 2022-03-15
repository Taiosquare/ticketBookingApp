const cluster = require('cluster'),
  numCPUs = require('os').cpus().length,
  express = require("express");

const app = express();

cluster.schedulingPolicy = cluster.SCHED_RR;

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
  console.log(`Worker ${process.pid} started`);

  require("./db/mongoose.js");
  require("dotenv").config();

  const
    bodyParser = require("body-parser"),
    helmet = require("helmet"),
    compression = require("compression"),
    passport = require("passport");

  const api = require("./api/api"),
    errorController = require("./api/controllers/system/error");

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

  const server = app.listen(process.env.PORT);

  const io = require("./socket").init(server);

  io.on("connection", (socket) => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}


