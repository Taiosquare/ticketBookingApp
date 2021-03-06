const express = require("express");
const router = express.Router();
const systemController = require("../../controllers/system/system");
const { body, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/getSignedURL")
    .get(
        systemController.getSignedURL
    );

router
    .route("/getSignedURLAuth")
    .get(
        authenticate,
        systemController.getSignedURLAuth
    );

router
    .route("/getHomePageEvents")
    .get(
        systemController.getHomePageEvents
    );
    
router
    .route("/getAllBanks")
    .get(
        systemController.getAllBanks
    );


module.exports = router;