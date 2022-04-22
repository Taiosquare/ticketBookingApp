const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/user/admin/admin");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/approveHost/:hostId")
    .put(
        authenticate,
        adminController.approveHost
    );
  
router
    .route("/suspendHost/:hostId")
    .put(
        authenticate,
        adminController.suspendHost
    );
  
router
    .route("/getUser/:userId")
    .get(
        authenticate,
        adminController.getUser
    );

router
    .route("/getUsers")
    .get(
        authenticate,
        adminController.getUsers
    );
    
router
    .route("/getHost/:hostId")
    .get(
        authenticate,
        adminController.getHost
    );

router
    .route("/getHosts")
    .get(
        authenticate,
        adminController.getHosts
    );
    
router
    .route("/getEvents")
    .get(
        authenticate,
        adminController.getEvents
    );
    
router
    .route("/getAdmin/:adminId")
    .get(
      authenticate,
      adminController.getAdministrator
    );

router
    .route("/getAdmins")
    .get(
      authenticate,
      adminController.getAdministrators
    );
    
router
    .route("/suspendAdmin/:adminId")
    .put(
      authenticate,
      adminController.suspendAdministrator
    );

// Get ticket
    
module.exports = router;
