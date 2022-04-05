// const express = require("express"),
//   router = express.Router(),
//   userController = require("../controllers/user"),
//   { body, param } = require("express-validator"),
//   authenticate = require("../../authentication/isAuth");

// router
//   .route("/searchEvents")
//   .get(
//     authenticate.user,
//     userController.searchEvents
//   );

// router
//   .route("/rateEvent/:eventId")
//   .put(
//     authenticate.user,
//     userController.rateEvent
//   );

// router
//   .route("/eventBankPayment/:eventId")
//   .post(
//     authenticate.user,
//     userController.eventBankPayment
//   );

// router
//   .route("/eventBankPaymentVerification/:eventId")
//   .put(
//     authenticate.user,
//     userController.eventBankPaymentVerification
//   );

// router
//   .route("/bookEvent/:eventId")
//   .post(
//     authenticate.user,
//     userController.saveEventDetails
//   );

// router
//   .route("/eventUSSDPayment/:eventId")
//   .post(
//     authenticate.user,
//     userController.eventUSSDPayment
//   );

// router
//   .route("/viewEvent/:id")
//   .get(
//     authenticate.user,
//     userController.viewEvent
//   );

// router
//   .route("/viewBookedEvents")
//   .get(
//     authenticate.user,
//     userController.viewBookedEvents
//   );

// module.exports = router;
