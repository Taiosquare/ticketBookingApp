// const express = require("express"),
//   router = express.Router(),
//   adminController = require("../../controllers/user/admin/admin"),
//   { body, param } = require("express-validator"),
//   authenticate = require("../../authentication/isAuth");

// router
//   .route("/approveHost/:hostId")
//     .put(
//         authenticate.admin,
//         adminController.approveHost
//     );
  
// router
//   .route("/suspendHost/:hostId")
//     .put(
//         authenticate.admin,
//         adminController.suspendHost
//     );
  
// router
//   .route("/viewUser/:userId")
//     .get(
//         authenticate.admin,
//         adminController.getUser
//     );

// router
//   .route("/viewUsers")
//     .get(
//         authenticate.admin,
//         adminController.getUsers
//     );
    
// // router
// //   .route("/viewPurchasedTickets/:userId")
// //     .get(
// //         authenticate.admin,
// //         adminController.getTickets
// //     );
    
// router
//   .route("/viewHost/:hostId")
//     .get(
//         authenticate.admin,
//         adminController.getHost
//     );

// router
//   .route("/viewHosts")
//     .get(
//         authenticate.admin,
//         adminController.getHosts
//     );
    
// router
//   .route("/viewEvents")
//     .get(
//         authenticate.admin,
//         adminController.getEvents
//     );
    
// router
//   .route("/viewAdmin/:adminId")
//     .get(
//       authenticate.admin,
//       adminController.getAdministrator
//     );

// router
//   .route("/viewAdmins")
//     .get(
//       authenticate.admin,
//       adminController.getAdministrators
//     );
    
// router
//   .route("/suspendAdmin/:adminId")
//     .put(
//       authenticate.admin,
//       adminController.suspendAdministrator
//     );
    
// module.exports = router;
