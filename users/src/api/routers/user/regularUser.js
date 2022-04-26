const express = require("express");
const router = express.Router();
const regularUserController = require("../../controllers/user/regularUser/regularUser");
const paymentController = require("../../controllers/user/regularUser/payment");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/searchEvents")
    .get(
        authenticate,
        regularUserController.searchEvents
    );

router
    .route("/rateEvent/:eventId")
    .put(
        authenticate,
        regularUserController.rateEvent
    );

router
    .route("/initiateEventPayment/:eventId")
    .post(
        authenticate,
        paymentController.initiateEventPayment
    );

router
    .route("/verifyEventPayment/:eventId")
    .put(
        authenticate,
        paymentController.verifyEventPayment
    );

router
    .route("/getEvent/:eventId")
    .get(
        authenticate,
        regularUserController.getEvent
    );

router
    .route("/getBookedEvents")
    .get(
        authenticate,
        regularUserController.getBookedEvents
    );
    
// Suspend Account

module.exports = router;
