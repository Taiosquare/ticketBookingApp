const express = require("express");
const router = express.Router();
const hostController = require("../../controllers/user/host/payment");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/host/viewPaymentDetails")
    .put(
        authenticate,
        hostController.viewPaymentDetails
    );
    
router
    .route("/host/createPaymentDetails")
    .put(
        authenticate,
        hostController.createPaymentDetails
    );
    
router
    .route("/host/updatePaymentDetails")
    .patch(
        authenticate,
        hostController.updatePaymentDetails
    );
    
module.exports = router;