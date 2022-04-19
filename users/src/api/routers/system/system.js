const express = require("express");
const router = express.Router();
const systemController = require("../../controllers/system/system");
const { body, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/getSignedURL")
    .post(
        authenticate,
        systemController.paymentSuccess
    );

router
    .route("/getSignedURLAuth")
    .post(
        authenticate,
        systemController.payHost
    );

module.exports = router;