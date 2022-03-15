require("dotenv").config();

const mg = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

module.exports = {
  async sendEmail(data) {
    return new Promise((resolve, reject) => {
      mg.messages().send(data, function (error, body) {
        error ? reject(error) : resolve(body);
      });
    });
  },
};