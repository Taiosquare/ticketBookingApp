require("dotenv").config();

const { User } = require("../models/user"),
  { Account } = require("../models/account"),
  { Event } = require("../models/event"),
  { Ticket } = require("../models/ticket"),
  mailer = require("../../services/mailer"),
  fetch = require("node-fetch");

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

const sendConfirmationMail = async (token, email, userType, sendType, name, baseURL) => {
  let from = `Energy Direct energydirect@outlook.com`,
    to = email,
    subject = `${userType} Account Confirmation`,
    html = `<p>Good Day ${name},</p> 
              <p>Please click this <a href="${baseURL}/auth/${sendType}?verify=${token}">link</a>
              to confirm your email.</p>`;

  const data = {
    from: from,
    to: to,
    subject: subject,
    html: html,
  };

  await mailer.sendEmail(data);
}

const hostSavePayment = async (event) => {
  let event2 = await Event.find({ transferCode: event.data.transfer_code });

  await Account.updateOne(
    { host: event2.host },
    {
      $push: {
        payments: {
          reference: event.data.reference,
          amount: event.data.amount / 100,
          currency: event.data.currency,
          paidAt: event.data.paid_at,
          bank: event.data.authorization.bank,
          tickets: ticketIds
        }
      }
    }
  )
}

const userSavePayment = async (event) => {
  let tickets = await Ticket.find({ paymentReference: event.data.reference });

  let ticketIds = tickets.map(ticket => {
    return ticket._id;
  });

  await User.updateOne(
    { _id: tickets[0].user },
    {
      $push: {
        payments: {
          reference: event.data.reference,
          amount: event.data.amount / 100,
          currency: event.data.currency,
          paidAt: event.data.paid_at,
          bank: event.data.authorization.bank,
          tickets: ticketIds
        }
      }
    }
  );
}

const createRecepientCode = async (name, accountNumber, bankName) => {
  let banks = await fetch('https://api.paystack.co/bank', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
    },
  });

  let banks2 = await banks.json(), code = "";

  for (bank of banks2.data) {
    if (bankName == bank.name) {
      code = bank.code;
      break;
    }
  }

  const params = {
    type: "nuban",
    name: name,
    description: `${name}'s recepient code creation`,
    account_number: accountNumber,
    bank_code: code,
    currency: "NGN"
  }

  let response = await fetch(`https://api.paystack.co/transferrecipient`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params),
  });

  let response2 = await response.json();

  return response2.data.recipient_code;
}

module.exports.environmentCheck = environmentCheck;
module.exports.validationErrorCheck = validationErrorCheck;
module.exports.returnValidationError = returnValidationError;
module.exports.sendConfirmationMail = sendConfirmationMail;
module.exports.hostSavePayment = hostSavePayment;
module.exports.userSavePayment = userSavePayment;
module.exports.createRecepientCode = createRecepientCode;
