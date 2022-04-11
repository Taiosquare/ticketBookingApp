const express = require("express");
const api = express.Router();
const authRouter = require("./routers/auth/auth");
const adminRouter = require("./routers/user/admin");
const hostRouter = require("./routers/user/host");
const paymentRouter = require("./routers/user/payment");
const systemRouter = require("./routers/system/system");
// const uploadRouter = require('./routers/upload'),
const userRouter = require("./routers/user/user");

api.use("/auth", authRouter);
api.use("/admin", adminRouter);
api.use("/host", hostRouter);
api.use("/payment", paymentRouter);
// api.use("/system", systemRouter);
// api.use("/upload", uploadRouter);
// api.use("/user", userRouter);

module.exports = api;
