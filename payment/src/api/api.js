const express = require("express");
const api = express.Router();
const paymentRouter = require("./routers/payment");

api.use("/payment", paymentRouter);

module.exports = api;
