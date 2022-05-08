const { User } = require("../models/user");
const { Payment } = require("../models/payment");
const { Event } = require("../models/event");
const { Ticket } = require("../models/ticket");
const crypto = require("crypto");
const mailer = require("../../services/mailer");
const fetch = require("node-fetch");


const environmentCheck = async (env) => {
  let address = "";

  env === "production"
    ? (address = "")
    : (address = `http://localhost:${process.env.PORT}`);

  return address;
};

const validationErrorCheck = async (errors) => {
  let errs = [];

  errors.errors.map((err) => {
    errs.push(err.msg);
  });

  return errs;
}

const returnValidationError = async (res, errors) => {
  return res.status(400).json({
    errors: await validationErrorCheck(errors)
  });
}

const sendConfirmationMail = async (token, email, name, baseURL) => {
    try {
        const from = `TBA@outlook.com`,
            to = email,
            subject = "Email Confirmation",
            html = `<p>Good Day ${name},</p> 
              <p>Please click this <a href="${baseURL}/verify-email?verify-email=${token}">link</a>
              to verify your email.</p>`;

        const data = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        await mailer.sendEmail(data);
    } catch (error) {
        return error;
    } 
}

const createToken = async () => {
    return await crypto.randomBytes(16).toString("hex");
}


module.exports.GeneralFunctions = {
    environmentCheck,
    validationErrorCheck,
    returnValidationError,
    sendConfirmationMail,
    createToken
}


