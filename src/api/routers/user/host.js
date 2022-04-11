const express = require("express");
const router = express.Router();
const hostController = require("../../controllers/user/host/host");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/addEvent")
    .post(
        authenticate,
        hostController.addEvent
    );

router
    .route("/editEvent/:eventId")
    .patch(
        authenticate,
        hostController.editEvent
    );

router
    .route("/deleteEvent/:eventId")
    .delete(
        authenticate,
        hostController.deleteEvent
    );

// router
//   .route("/verifyTicketPayment/:eventId")
//   .put(
//     authenticate.host,
//     hostController.verifyTicketPayment
//   );

router
    .route("/viewBookedUsers/:eventId")
    .get(
        authenticate,
        hostController.viewBookedUsers
    );

router
    .route("/getEvent/:eventId")
    .get(
        authenticate,
        hostController.getEvent
    );

router
    .route("/getEvents")
    .get(
        authenticate,
        hostController.getEvents
    );

module.exports = router;
