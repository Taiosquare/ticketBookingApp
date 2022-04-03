const { User } = require("../../models/user");
const { RouteResponse } = require("../../helpers/routeResponse");
const { StandardResponse } = require("../../helpers/standardResponse");
const { AuthManager } = require("../../managers/auth/authManager");
const { Validations } = require("../../helpers/validations");
const { startSession } = require("mongoose");
const GeneralFunctions = require("../../functions/generalFunctions");
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

        const user = await GeneralFunctions.userExists(req.body);

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
  if (req.body.type == "admin") {
    UsersAuthFunctions.adminLogin(req, res);
  } else if (req.body.type == "host") {
    UsersAuthFunctions.hostLogin(req, res);
  } else if (req.body.type == "user") {
    UsersAuthFunctions.userLogin(req, res);
  }
}

exports.adminLogout = async (req, res) => {
  ControllersFunctions.logout(req, res, req.user._id, Admin, "Admin");
};

exports.hostLogout = async (req, res) => {
  ControllersFunctions.logout(req, res, req.user._id, Host, "Host");
};

exports.userLogout = async (req, res) => {
  ControllersFunctions.logout(req, res, req.user._id, User, "User");
};

exports.sendResetPasswordLink = async (req, res) => {
  if (req.body.type == "admin") {
    ControllersFunctions.sendResetPasswordLink(req, res, req.body.email, Admin, "Admin", "admin");
  } else if (req.body.type == "host") {
    ControllersFunctions.sendResetPasswordLink(req, res, req.body.email, Host, "Host", "host");
  } else if (req.body.type == "user") {
    ControllersFunctions.sendResetPasswordLink(req, res, req.body.email, User, "User", "user");
  }
};

exports.resetPassword = async (req, res) => {
  if (req.body.type == "admin") {
    ControllersFunctions.resetPassword(req, res, req.params.token, Admin, "Admin");
  } else if (req.body.type == "host") {
    ControllersFunctions.resetPassword(req, res, req.params.token, Host, "Host");
  } else if (req.body.type == "user") {
    ControllersFunctions.resetPassword(req, res, req.params.token, User, "User");
  }
};

exports.setNewPassword = async (req, res) => {
  if (req.body.type == "admin") {
    ControllersFunctions.setNewPassword(req, res, Admin);
  } else if (req.body.type == "host") {
    ControllersFunctions.setNewPassword(req, res, Host);
  } else if (req.body.type == "user") {
    ControllersFunctions.setNewPassword(req, res, User);
  }
};

exports.confirmMail = async (req, res) => {
  if (req.body.type == "admin") {
    ControllersFunctions.confirmMail(req, res, req.params.token, Admin, "Admin");
  } else if (req.body.type == "host") {
    ControllersFunctions.confirmMail(req, res, req.params.token, Host, "Host");
  } else if (req.body.type == "user") {
    ControllersFunctions.confirmMail(req, res, req.params.token, User, "User");
  }
};

exports.resendConfirmationMail = async (req, res) => {
  if (req.body.type == "admin") {
    ControllersFunctions.resendConfirmationMail(req, res, req.body.id, Admin, "Admin", "admin");
  } else if (req.body.type == "host") {
    ControllersFunctions.resendConfirmationMail(req, res, req.body.id, Host, "Host", "host");
  } else if (req.body.type == "user") {
    ControllersFunctions.resendConfirmationMail(req, res, req.body.id, User, "User", "user");
  }
}



