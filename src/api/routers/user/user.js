const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/user/user");
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
    .route("/eventBankPayment/:eventId")
    .post(
        authenticate,
        userController.eventBankPayment
    );

router
    .route("/eventBankPaymentVerification/:eventId")
    .put(
        authenticate,
        userController.eventBankPaymentVerification
    );

router
    .route("/bookEvent/:eventId")
    .post(
        authenticate,
        userController.saveEventDetails
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
