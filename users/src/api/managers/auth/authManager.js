const { User } = require("../../models/user");
const { GeneralFunctions } = require("../../functions/generalFunctions");
const { AuthFunctions } = require("../../functions/auth/authFunctions");
const { StandardResponse } = require("../../helpers/standardResponse");
const mailer = require("../../../services/mailer");
const mongoose = require("mongoose");
const argon2 = require("argon2");

const createAdmin = async (session, opts, requestBody, baseurl) => {
    try {
        const { username, firstname, lastname, email, password, role } = requestBody;

        const hashedPassword = await AuthFunctions.hashPassword(password);

        const token = await GeneralFunctions.createToken();

        const savedObject = await User.create([
            {
                _id: mongoose.Types.ObjectId(),
                role: role,
                username: username,
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                accountApproved: true,
                confirmationToken: token,
                confirmationTokenExpiration: Date.now() + 3600000
            }
        ], opts);

        await GeneralFunctions.sendConfirmationMail(token, email, firstname, baseurl);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Admin successfully added.",
            {
                user: {
                    _id: savedObject[0]._id,
                    username: savedObject[0].username,
                    firstname: savedObject[0].firstname,
                    lastname: savedObject[0].lastname,
                    email: savedObject[0].email,
                    role: savedObject[0].role,
                }
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const createUser = async (session, opts, requestBody, baseurl) => {
    try {
        const { username, firstname, lastname, email, position, role, password, businessDetails, profilePicture } = requestBody;

        const hashedPassword = await AuthFunctions.hashPassword(password);

        const token = await GeneralFunctions.createToken();

        const userObject = {
            _id: mongoose.Types.ObjectId(),
            role: role,
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            position: position,
            password: hashedPassword,
            profilePicture: profilePicture,
            businessDetails: businessDetails,
            confirmationToken: token,
            confirmationTokenExpiration: Date.now() + 3600000
        };

        if (role == "host") {
            userObject.rating = {
                averageScore: 0,
                numOfRatings: 0,
                ratings: [],
                raters: []
            }
        }

        const savedObject = await User.create([userObject], opts);

        await GeneralFunctions.sendConfirmationMail(token, email, firstname, baseurl);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "User successfully added.",
            {
                user: {
                    _id: savedObject[0]._id,
                    username: savedObject[0].username,
                    email: savedObject[0].email,
                    role: savedObject[0].role
                },
                emailConfirmationToken: token
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const login = async (requestBody) => {
    try {
        const { email, password } = requestBody;

        let user = await AuthFunctions.findUserByEmail(email);

        if ((!user) || (!await argon2.verify(user.password, password))) {
            return StandardResponse.errorMessage("Invalid Username or Password");
        }

        const refreshToken = await AuthFunctions.generateRefreshToken(user._id);
        const accessToken = await AuthFunctions.generateAuthToken(user._id);

        user.token = refreshToken;

        await user.save();
        // await user.save(opts)

        return StandardResponse.successMessage(
            "Login Successful",
            {
                user: {
                    _id: user._id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    role: user.role,
                    businessName: user.businessDetails ? user.businessDetails.name : null,
                    businessEmail: user.businessDetails ? user.businessDetails.email : null,
                    emailVerified: user.emailVerified,
                    accountApproved: user.accountApproved,
                    profilePicture: user.profilePicture ? user.profilePicture : null
                },
                tokens: {
                    access: {
                        token: accessToken,
                        expiresIn: "5m",
                    },
                    refresh: {
                        token: refreshToken,
                        expiresIn: "7d"
                    }
                },
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const sendUserResetPasswordLink = async (session, opts, requestBody, user, baseurl) => {
    try {
        const { email, expirationTime } = requestBody;
        let exprTime = 0;

        if (expirationTime) {
            exprTime = expirationTime;
        } else {
            exprTime = 3600000;
        }

        const token = await GeneralFunctions.createToken();

        await User.updateOne(
            { email: email },
            {
                $set: {
                    resetToken: token,
                    resetTokenExpiration: Date.now() + exprTime
                }
            },
            opts
        );

        const from = `Energy Direct energydirect@outlook.com`,
            to = user.email,
            subject = `Account Password Reset`,
            html = `<p>Good Day ${user.firstname},</p><p>Please click this <a href="${baseurl}/login?reset-password=${token}"> link</a> to reset your password.</p>`;

        const data = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        await mailer.sendEmail(data);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Password Reset Link Successfully Sent",
            {
                userId: user._id,
                resetToken: token
            }
        );
    } catch (error) {
        console.log(error);

        return StandardResponse.serverError(error);
    }
}

const resetPassword = async (session, opts, requestBody) => {
    try {
        const { userId, newPassword, passwordToken } = requestBody;

        const user = await User.findOne({
            _id: userId,
            resetToken: passwordToken,
        });

        if (user.resetTokenExpiration < new Date()) {
            return StandardResponse.errorMessage("Reset Token Expired");
        }

        const hashedPassword = await AuthFunctions.hashPassword(newPassword);

        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiration: null
                }
            }, 
            opts
        );

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Password Reset Successful"
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const verifyMail = async (session, opts, token) => {
    try {
        const user = await User.findOne({
            confirmationToken: token,
        });

        if (user.confirmationTokenExpiration < new Date()) {
            return StandardResponse.errorMessage("Confirmation Token Expired");
        }

        await User.updateOne(
            { confirmationToken: token },
            {
                $set: {
                    emailVerified: true,
                    confirmationToken: null,
                    confirmationTokenExpiration: null
                }
            },
            opts
        );

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "E-Mail Successfully Verified"
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const resendVerificationMail = async (session, opts, userId, baseurl) => {
    try {
        const user = await User.findById(userId);

        if (user.email == null) {
            return StandardResponse.errorMessage("E-Mail Address not Registered");
        }

        const token = await GeneralFunctions.createToken();

        await User.updateOne(
            { email: user.email },
            {
                $set: {
                    confirmationToken: token,
                    confirmationTokenExpiration: Date.now() + 3600000
                }
            },                                                                                                                                                                                                               
            opts
        );

        await GeneralFunctions
            .sendConfirmationMail(token, user.email, user.firstname, baseurl);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "E-Mail Verification Link Successfully resent",
            {
                verificationToken: token,
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.AuthManager = {
    createAdmin,
    createUser,
    login,
    sendUserResetPasswordLink,
    resetPassword,
    verifyMail,
    resendVerificationMail
};