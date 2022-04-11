const express = require("express");
const router = express.Router();
const hostController = require("../../controllers/user/host/payment");
const userController = require("../../controllers/user/user/payment");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/host/updateAccount")
    .patch(
        authenticate,
        hostController.updateAccountDetails
    );
    
module.exports = router;