const config = require("../../config");

const mg = require("mailgun-js")({
  apiKey: config.MAILGUN_API_KEY,
  domain: config.MAILGUN_DOMAIN,
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