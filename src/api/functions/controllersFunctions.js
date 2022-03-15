const mongoose = require("mongoose"),
    crypto = require("crypto"),
    argon2 = require("argon2"),
    mailer = require("../../services/mailer"),
    { validationResult } = require("express-validator"),
    AuthFunctions = require("./auth/authFunctions"),
    GeneralFunctions = require("./generalFunctions");

const logout = async (req, res, id, Model, userType) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let user = await Model.findById(id);

        user.token = undefined;

        await user.save();

        res.status(200).json({
            message: `${userType} Logout Successful`,
        });
    } catch (error) {
        res.status(400).json({
            error: `${userType} Logout Failed, please try again`,
        });
    }
}

const sendResetPasswordLink = async (req, res, email, Model, userType, sendType) => {
    try {
        const errors = validationResult(req),
            token = await crypto.randomBytes(16).toString("hex");

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let user = await Model.findOne({ email: email });
        let name = "", address = "";

        if (!user) {
            return res.status(400).json({
                error: "E-Mail Address not Found"
            });
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        user.save();

        if (userType == "Admin") { name = user.username; }
        if (userType == "Host") { name = user.brandName; }
        if (userType == "User") { name = user.firstname; }

        const baseURL = req.headers.baseurl;

        let from = `Energy Direct energydirect@outlook.com`,
            to = user.email,
            subject = `${userType} Account Password Reset`,
            html = `<p>Good Day ${name},</p> 
        <p>Please click this <a href="${baseURL}/auth/${sendType}?reset=${token}">
        link</a> to reset your password.</p>`;

        const data = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        await mailer.sendEmail(data);

        res.status(200).json({
            message: "Password Reset Link Successfully Sent"
        });
    } catch (error) {
        res.status(400).json({
            error: "Error sending password reset token, please try again.",
        });
    }
}

const resetPassword = async (req, res, token, Model, userType) => {
    try {
        const user = await Model.findOne({
            resetToken: token,
        });

        res.status(200).json({
            id: user._id.toString(),
            passwordToken: token,
        });
    } catch (error) {
        res.status(400).json({ error: `Error retrieving ${userType} Data` });
    }
}

const setNewPassword = async (req, res, Model) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        const { id, newPassword, passwordToken } = req.body;

        let user = await Model.findOne({
            resetToken: passwordToken,
            _id: id,
        });

        if (user.resetTokenExpiration < new Date()) {
            return res.status(400).json({ error: "Reset Token Expired." });
        }

        const hashedPassword = await argon2.hash(newPassword),
            access = await AuthFunctions.generateAuthToken(id),
            refresh = await AuthFunctions.generateRefreshToken(id);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.status(200).json({
            message: "Password Reset Successful",
            tokens: {
                access: {
                    token: access,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refresh,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        res.status(400).json({ error: "Password Reset Failed" });
    }
}

const confirmMail = async (req, res, token, Model, userType) => {
    try {
        let user = await Model.findOne({
            confirmationToken: token,
        });

        if (user.confirmationTokenExpiration < new Date()) {
            return res.status(400).json({ error: "Confirmation Token Expired." });
        }

        user.confirmedMail = true;
        user.confirmationToken = undefined;
        user.confirmationTokenExpiration = undefined;

        await user.save();

        res.status(200).json({
            message: `${userType} E-Mail Successfully Confirmed`,
        });
    } catch (error) {
        res.status(400).json({
            error: `${userType} E-Mail Failed to Confirm`
        });
    }
}

const resendConfirmationMail = async (req, res, id, Model, userType, sendType) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        const token = await crypto.randomBytes(16).toString("hex");
        let user = await Model.findById(id);

        if (!user.email) {
            return res.status(400).json({
                error: "E-Mail Address not Registered"
            });
        }

        const baseURL = req.headers.baseurl;

        if (userType == "Admin") { name = user.username; }
        if (userType == "Host") { name = user.brandName; }
        if (userType == "User") { name = user.firstname; }

        await GeneralFunctions.sendConfirmationMail(token, user.email, userType, sendType, name, baseURL)

        user.confirmationToken = token;
        user.confirmationTokenExpiration = Date.now() + 3600000;

        await user.save();

        res
            .status(200)
            .json({ message: "E-Mail Confirmation Link Successfully Sent" });
    } catch (error) {
        res
            .status(400)
            .json({ error: "E-Mail Confirmation Link Failed to Send" });
    }
};


module.exports.logout = logout;
module.exports.sendResetPasswordLink = sendResetPasswordLink;
module.exports.resetPassword = resetPassword;
module.exports.setNewPassword = setNewPassword;
module.exports.confirmMail = confirmMail;
module.exports.resendConfirmationMail = resendConfirmationMail;
