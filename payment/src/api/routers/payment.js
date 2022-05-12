const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment");
const { check, param } = require("express-validator");

router
    .route("/test")
    .patch(
        paymentController.test
    );
    
module.exports = router;