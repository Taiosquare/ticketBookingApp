const passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  mongoose = require("mongoose"),
  { User } = require('../models/user');

require("dotenv").config();

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/user/facebook/redirect"
},
  (accessToken, refreshToken, profile, done) => {
    let firstname = profile.displayName.split(" ")[0];
    let lastname = profile.displayName.split(" ")[1];

    User.findOrCreate({ name: profile.displayName }, { name: profile.displayName, userid: profile.id }, function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });

    User.findOrCreate(
      { profileId: profile.id },
      {
        _id: mongoose.Types.ObjectId(),
        firstname: firstname,
        lastname: lastname,
        email: profile.email,
        profileId: profile.id,
        events: [],
      },
      (err, user) => {
        if (err) { return done(err); }
        done(null, user);
      }
    );
  }
));

module.exports = passport;