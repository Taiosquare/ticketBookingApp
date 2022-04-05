// const express = require("express"),
//   router = express.Router(),
//   hostController = require("../controllers/host"),
//   { body, param } = require("express-validator"),
//   authenticate = require("../../authentication/isAuth");

// router
//   .route("/addEvent")
//   .post(
//     authenticate.host,
//     hostController.addEvent
//   );

// router
//   .route("/editEvent/:eventId")
//   .patch(
//     authenticate.host,
//     hostController.editEvent
//   );

// router
//   .route("/deleteEvent/:eventId")
//   .delete(
//     authenticate.host,
//     hostController.deleteEvent
//   );

// router
//   .route("/verifyTicketPayment/:eventId")
//   .put(
//     authenticate.host,
//     hostController.verifyTicketPayment
//   );

// router
//   .route("/viewBookedUsers/:eventId")
//   .get(
//     authenticate.host,
//     hostController.viewBookedUsers
//   );

// router
//   .route("/viewEvent/:id")
//   .get(
//     authenticate.host,
//     hostController.viewEvent
//   );

// router
//   .route("/viewEvents")
//   .get(
//     authenticate.host,
//     hostController.viewEvents
//   );

// router
//   .route("/updateAccount")
//   .patch(
//     authenticate.host,
//     hostController.updateAccountDetails
//   );

// module.exports = router;
