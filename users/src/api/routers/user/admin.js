const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/user/admin/admin");
const { check, param } = require("express-validator");
const authenticate = require("../../authentication/isAuth");

router
    .route("/approveHost/:hostId")
    .put(
        authenticate,
        [
            param("hostId", "Invalid hostId Type").isMongoId(),
        ],
        adminController.approveHost
    );
  
router
    .route("/suspendHost/:hostId")
    .put(
        authenticate,
        [
            check("status")
                .notEmpty().withMessage("User Suspension Status cannot be empty").bail()
                .isBoolean().withMessage("User Suspension Status should be a Boolean"),
            param("hostId", "Invalid hostId Type").isMongoId(),
        ],
        adminController.setHostSuspensionStatus
    );
  
router
    .route("/viewRegularUser/:userId")
    .get(
        authenticate,
        [
            param("userId", "Invalid userId Type").isMongoId(),
        ],
        adminController.viewRegularUser
    );

router
    .route("/viewRegularUsers")
    .get(
        authenticate,
        adminController.viewRegularUsers
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
