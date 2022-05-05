const dotenv = require('dotenv');
const path = require('path');
const express = require('express');

const app = express();

dotenv.config({
  path: path.resolve(__dirname, '../.env/' + app.get('env') + '.env')
});

module.exports = {
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  PAYSTACK_TEST_SECRET: process.env.PAYSTACK_TEST_SECRET,
  PAYMENT_PORT: process.env.PAYMENT_PORT,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  AMQP_URL: process.env.AMQP_URL
}
