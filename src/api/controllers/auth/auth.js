const { Admin } = require("../models/admin"),
  { Host } = require("../models/host"),
  { User } = require("../models/user"),
  ControllersFunctions = require("../functions/controllersFunctions"),
  UsersAuthFunctions = require("../functions/usersAuthFunctions");

exports.register = async (req, res) => {
  if (req.body.type == "admin") {
    UsersAuthFunctions.adminRegister(req, res);
  } else if (req.body.type == "host") {
    UsersAuthFunctions.hostRegister(req, res);
  } else if (req.body.type == "user") {
    UsersAuthFunctions.userRegister(req, res);
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



