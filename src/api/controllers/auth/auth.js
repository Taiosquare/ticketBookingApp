const { User } = require("../../models/user");
const { RouteResponse } = require("../../helpers/routeResponse");
const { StandardResponse } = require("../../helpers/standardResponse");
const { AuthManager } = require("../../managers/auth/authManager");
const { Validations } = require("../../helpers/validations");
const { startSession } = require("mongoose");
const { GeneralFunctions } = require("../../functions/generalFunctions");
const { AuthFunctions } = require("../../functions/auth/authFunctions");
const argon2 = require("argon2");


exports.createAdmin = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        if (!req.headers.baseurl) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Base URL not sent"), res
            );
        }
      
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "superAdmin");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        session.startTransaction();
        const opts = { session, new: true };

        const createAdmin = await AuthManager.createAdmin(session, opts, req.body, req.headers.baseurl);

        if (createAdmin.status == false) {
            throw createAdmin.error;
        }  
            
        RouteResponse.OkMessage201(createAdmin, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Admin could not be created, please try again."), res
        );
    }
}

exports.register = async (req, res) => {
    const session = await startSession();

    try {
        if (!req.headers.baseurl) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Base URL not sent"), res
            );
        }

        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const user = await AuthFunctions.userExists(req.body);

        if (user != null) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("User already registered"), res
            );
        }

        session.startTransaction();
        const opts = { session, new: true };

        const createUser = await AuthManager.createUser(session, opts, req.body, req.headers.baseurl)

        if (createUser.status == false) {
            throw createUser.error;
        } 
            
        RouteResponse.OkMessage201(createUser, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("User could not be added, please try again."), res
        );
    }
}

exports.login = async (req, res) => {   
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const login = await AuthManager.login(req.body);
       
        if (login.status == false) {
            if (login.serverError == true) {
                throw login.error;
            }
            
            return RouteResponse.badRequest(loginUser, res);
        }  

        RouteResponse.OkMessage(login, res);
    } catch (error) {
        console.log({ error });
       
        RouteResponse.internalServerError(
            StandardResponse.serverError("Login Process Failed, Please Try Again"), res
        );
    }
}

exports.logout = async (req, res) => {
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        session.startTransaction();
        const opts = { session, new: true };

        await User.updateOne(
            { _id: req.user._id },
            { $set: { token: null } },
            opts
        );

        await session.commitTransaction();
        session.endSession();

        RouteResponse.OkMessage(
            StandardResponse.successMessage("User Logout Successful"), res
        );
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("User Logout Failed, please try again"), res
        );
    }
};

exports.sendResetPasswordLink = async (req, res) => {
    const session = await startSession();

    try {
        if (!req.headers.baseurl) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Base URL not sent"), res
            );
        }

        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const user = await GeneralFunctions.findUserByEmail(req.body.email);
    
        if (user == null) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Password Reset Link Successfully Sent"), res
            );
        }

        session.startTransaction();
        const opts = { session, new: true };

        const resetPasswordLink = await AuthManager.sendUserResetPasswordLink(session, opts, req.body, user, req.headers.baseurl)

        if (resetPasswordLink.status == false) {
            throw resetPasswordLink.error;
        } 
            
        RouteResponse.OkMessage(resetPasswordLink, res);
    } catch (error) {
        console.log(error);

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error sending Password Reset Link, please try again."), res
        );
    }
};

exports.verifyPasswordToken = async (req, res) => {
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const user = await GeneralFunctions.findUserByToken(req.params.token);

        if (user == null) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Non-existent User"), res
            );
        }

        RouteResponse.OkMessage(
            StandardResponse.successMessage(
                null,
                {
                    userId: user._id.toString(),
                    passwordToken: user.resetToken,
                }
            ),
            res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error verifying password token"), res
        );
    }
};

exports.resetPassword = async (req, res) => {
    const session = await startSession();
    
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        session.startTransaction();
        const opts = { session, new: true };
 
        const resetPassword = await AuthManager.resetPassword(session, opts, req.body);

        if (resetPassword.status == false) {
            if (resetPassword.serverError == true) {
                throw resetPassword.error;
            }
            
            return RouteResponse.badRequest(resetPassword, res);
        }  
            
        RouteResponse.OkMessage(resetPassword, res);
    } catch (error) {
        console.log(error);

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Password Reset Failed"), res
        );
    }
};

exports.verifyMail = async (req, res) => {
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        session.startTransaction();
        const opts = { session, new: true };

        const verifyMail = await AuthManager.verifyMail(session, opts, req.params.token);

        if (verifyMail.status == false) {
            throw verifyMail.error;
        } 
            
        RouteResponse.OkMessage(verifyMail, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("E-Mail Failed to Verify"), res
        );
    }
};

exports.resendVerificationMail = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if (!req.headers.baseurl) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Base URL not sent"), res
            );
        }

        session.startTransaction();
        const opts = { session, new: true };

        const resendVerificationMail = await AuthManager.resendVerificationMail(session, opts, req.user._id, req.headers.baseurl);
      
        if (resendVerificationMail.status == false) {
            throw resendVerificationMail.error;
        } 
            
        RouteResponse.OkMessage(resendVerificationMail, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("E-Mail Confirmation Link Failed to resend"), res
        );
    }
}

exports.verifyPassword = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const { password } = req.body;

        const user = await User.findById(req.user._id);

        if (!(await argon2.verify(user.password, password))) {
            return RouteResponse.badRequest(
                StandardResponse.errorMessage("Invalid Password"), res
            );
        }

        RouteResponse.OkMessage(
            StandardResponse.successMessage("Valid Password"), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error verifying password, please try again."), res
        );
    }
};

exports.setNewPassword = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const { newPassword } = req.body;

        session.startTransaction();
        const opts = { session, new: true };

        await User.updateOne(
            { _id: req.user._id },
            { $set: { password: await argon2.hash(newPassword) } },
            opts
        );

        await session.commitTransaction();
        session.endSession();

        RouteResponse.OkMessage(
            StandardResponse.successMessage("Password Reset Successful"), res
        );
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error Resetting Password"), res
        );
    }
};


