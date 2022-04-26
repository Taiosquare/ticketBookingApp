const express = require("express");
const api = express.Router();
const authRouter = require("./routers/auth/auth");
const adminRouter = require("./routers/user/admin");
const hostRouter = require("./routers/user/host");
const paymentRouter = require("./routers/user/payment");
const regularUserRouter = require("./routers/user/regularUser");
const systemRouter = require("./routers/system/system");


api.use("/auth", authRouter);
api.use("/admin", adminRouter);
api.use("/host", hostRouter);
api.use("/payment", paymentRouter);
api.use("/regularUser", regularUserRouter);
api.use("/system", systemRouter);


module.exports = api;
