const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/user/user");
const paymentController = require("../../controllers/user/user/payment");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/searchEvents")
    .get(
        authenticate,
        userController.searchEvents
    );

router
    .route("/rateEvent/:eventId")
    .put(
        authenticate,
        userController.rateEvent
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
        userController.getEvent
    );

router
    .route("/getBookedEvents")
    .get(
        authenticate,
        userController.getBookedEvents
    );

module.exports = router;
