const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");
const authController = require("../../controllers/auth/auth");
const { check, param } = require("express-validator");
const passportFacebook = require('../../authentication/facebook');
const authenticate = require("../../authentication/isAuth");

router
    .route("/createAdmin")
    .post(
        authenticate,
        [
            check("username")
                .notEmpty().withMessage("Username cannot be empty").bail()
                .isString().withMessage("Username should be a String").bail()
                .isLength({ min: 6, max: 24 }).withMessage("Username must be between 6 and 24 characters in length")
                .custom(async (username) => {
                    const user = await User.findOne({ username: username });

                    if (user) {
                        throw new Error("E-Mail Address/Username already registered");
                    }
                }),
            check("firstname")
                .notEmpty().withMessage("Firstname cannot be empty").bail()
                .isString().withMessage("Firstname should be a String"),
            check("lastname")
                .notEmpty().withMessage("Lastname cannot be empty").bail()
                .isString().withMessage("Lastname should be a String"),
            check("email")
                .notEmpty().withMessage("Email cannot be empty").bail()
                .isEmail().withMessage("Email is invalid").bail()
                .custom(async (email) => {
                    const user = await User.findOne({ email: email });

                    if (user) {
                        throw new Error("E-Mail Address already registered");
                    }
                }),
            check("role")
                .notEmpty().withMessage("Role cannot be empty").bail()
                .isString().withMessage("Role should be a String"),
            check("password")
                .notEmpty().withMessage("Password cannot be empty").bail()
                .isLength({ min: 8 }).withMessage("Password must have at least 8 characters").bail()
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage("Password must have at least 1 uppercase, 1 lowercase letter and 1 number"),
        ],
        authController.createAdmin
    );

router
    .route("/register")
    .post(
        [
            check("username")
                .notEmpty().withMessage("Username cannot be empty").bail()
                .isString().withMessage("Username should be a String")
                .isLength({ min: 6, max: 24 }).withMessage("Username must be between 6 and 24 characters in length"),
            check("firstname")
                .notEmpty().withMessage("Firstname cannot be empty").bail()
                .isString().withMessage("Firstname should be a String"),
            check("lastname")
                .notEmpty().withMessage("Lastname cannot be empty").bail()
                .isString().withMessage("Lastname should be a String"),
            check("email")
                .notEmpty().withMessage("Email cannot be empty").bail()
                .isEmail().withMessage("Email is invalid").bail()
                .custom(async (email) => {
                    const user = await User.findOne({ email: email });

                    if (user) {
                        throw new Error("E-Mail Address already registered");
                    }
                }),
            check("password")
                .notEmpty().withMessage("Password cannot be empty").bail()
                .isLength({ min: 8 }).withMessage("Password must have at least 8 characters").bail()
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage("Password must have at least 1 uppercase, 1 lowercase letter and 1 number"),
            check("role")
                .notEmpty().withMessage("Role cannot be empty").bail()
                .isString().withMessage("Role should be a String"),
            check("position")
                .optional()
                .notEmpty().withMessage("Position cannot be empty").bail()
                .isString().withMessage("Position should be a String"),
            check("businessDetails.name")
                .optional()
                .notEmpty().withMessage("Company Name cannot be empty").bail()
                .isString().withMessage("Company Name should be a String"),
            check("businessDetails.address")
                .optional()
                .notEmpty().withMessage("Company Address cannot be empty").bail()
                .isString().withMessage("Company Address should be a String"),
            check("businessDetails.landline")
                .optional()
                .notEmpty().withMessage("Business Landline cannot be empty").bail()
                .isString().withMessage("Business Landline should be a String"),
            check("businessDetails.email")
                .optional()
                .notEmpty().withMessage("Company Email cannot be empty").bail()
                .isEmail().withMessage("Company Email is invalid"),
        ],
        authController.register
    );

router
    .route("/login")
    .post(
        [
            check("email")
                .notEmpty().withMessage("Email cannot be empty").bail()
                .isEmail().withMessage("Email is invalid"),
            check("password")
                .notEmpty().withMessage("Password cannot be empty")
        ],
        authController.login
    );

router
    .route("/logout")
    .post(
        authenticate,
        authController.logout
    );

router
    .route("/sendResetPasswordLink")
    .post(
        [
            check("email")
                .notEmpty().withMessage("Email cannot be empty").bail()
                .isEmail().withMessage("Email is invalid"),
        ],
        authController.sendResetPasswordLink
    );

router
    .route("/verifyPasswordToken/:token")
    .get(
        [
            param("token")
                .isLength({ min: 32, max: 32 }).withMessage("Token should be 32 characters long").bail()
                .isString().withMessage("Token should be a String")
        ],
        authController.verifyPasswordToken
    );

router
    .route("/resetPassword")
    .patch(
        [
            check("userId")
                .notEmpty().withMessage("UserId cannot be empty").bail()
                .isMongoId().withMessage("UserId should be a MongoId"),
            check("newPassword")
                .notEmpty().withMessage("New Password cannot be empty").bail()
                .isLength({ min: 8 }).withMessage("New Password must have at least 8 characters").bail()
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage("New Password must have at least 1 uppercase, 1 lowercase letter and 1 number"),
            check("passwordToken")
                .notEmpty().withMessage("Password Token cannot be empty")
                .isLength({ min: 32, max: 32 }).withMessage("Password Token should be 32 characters long").bail()
                .isString().withMessage("Password Token should be a String"),
        ],
        authController.resetPassword
    );

router
    .route("/verifyeMailAddress/:token")
    .patch(
        [
            param("token")
                .isLength({ min: 32, max: 32 }).withMessage("Token should be 32 characters long").bail()
                .isString().withMessage("Token should be a String"),
        ],
        authController.verifyeMailAddress
    );

router
    .route("/resendeMailVerificationLink")
    .post(
        authenticate,
        authController.resendeMailVerificationLink
    );

router
    .route("/verifyPassword")
    .post(
        authenticate,
        [
            check("password")
              .notEmpty().withMessage("Password cannot be empty")
        ],
        authController.verifyPassword
    );

router
    .route("/setNewPassword")
    .patch(
        authenticate,
        [
            check("newPassword")
              .notEmpty().withMessage("New Password cannot be empty").bail()
              .isLength({ min: 8 }).withMessage("New Password must have at least 8 characters").bail()
              .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage("New Password must have at least 1 uppercase, 1 lowercase letter and 1 number"),
        ],
        authController.setNewPassword
    );

router
    .route("/user/facebook")
    .get(
        passportFacebook.authenticate('facebook')
    );

router
    .route('/user/facebook/redirect')
    .get(
        passportFacebook.authenticate('facebook', { failureRedirect: '/user/login' }),
        (req, res) => {
          res.redirect('/');
        }
    );
    
module.exports = router;
