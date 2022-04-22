const dotenv = require('dotenv');
const path = require('path');
const express = require('express');

const app = express();

dotenv.config({
  path: path.resolve(__dirname, '../.env/' + app.get('env') + '.env')
});

module.exports = {
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  PAYSTACK_TEST_SECRET: process.env.PAYSTACK_TEST_SECRET,
  PORT: process.env.USERS_PORT,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_BUCKET: process.env.S3_BUCKET
}
