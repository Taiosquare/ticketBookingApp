const express = require("express"),
    api = express.Router(),
    authRouter = require("./routers/auth/auth"),
    adminRouter = require("./routers/user/admin"),
    hostRouter = require("./routers/user/host"),
    systemRouter = require("./routers/system/system"),
    // uploadRouter = require('./routers/upload'),
    userRouter = require("./routers/user/user");

api.use("/auth", authRouter);
// api.use("/admin", adminRouter);
// api.use("/host", hostRouter);
// api.use("/system", systemRouter);
// api.use("/upload", uploadRouter);
// api.use("/user", userRouter);

module.exports = api;
