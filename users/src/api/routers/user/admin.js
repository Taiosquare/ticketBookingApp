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
                .notEmpty().withMessage("Host Suspension Status cannot be empty").bail()
                .isBoolean().withMessage("Host Suspension Status should be a Boolean"),
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
    .route("/viewHost/:hostId")
    .get(
        authenticate,
        [
            param("hostId", "Invalid hostId Type").isMongoId(),
        ],
        adminController.viewHost
    );

router
    .route("/viewHosts")
    .get(
        authenticate,
        adminController.viewHosts
    );
    
router
    .route("/viewEvents")
    .get(
        authenticate,
        adminController.viewEvents
    );
    
router
    .route("/viewAdmin/:adminId")
    .get(
        authenticate,
        [
            param("adminId", "Invalid adminId Type").isMongoId(),
        ],
        adminController.viewAdministrator
    );

router
    .route("/viewAdmins")
    .get(
      authenticate,
      adminController.viewAdministrators
    );
    
router
    .route("/suspendAdmin/:adminId")
    .put(
        authenticate,
        adminController.suspendAdministrator
    );
    
module.exports = router;
