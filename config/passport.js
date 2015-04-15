var _ = require('lodash');
var passport = require('passport');
var DwollaStrategy = require('passport-dwolla').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var secrets = require('./secrets');
var User = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Dwolla.
 */
passport.use(new DwollaStrategy(secrets.dwolla,function(req, refreshToken, params, profile, done) {
  if (req.user) {
    User.findOne({ dwolla: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already an Dwolla account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.dwolla = profile.id;
          user.tokens.push({ kind: 'dwolla', refreshToken: refreshToken, params: params });
          req.session.accessToken = user.tokens.params.access_token;
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
          user.profile.website = user.profile.website || profile._json.data.website;
          user.save(function(err) {
            req.flash('info', { msg: 'Dwolla account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ dwolla: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      // if there is no user found with that dwolla id, create them
      var user = new User();
      user.dwolla = profile.id; // set the users dwolla id
      user.tokens.push({ kind: 'dwolla', refreshToken: refreshToken, params: params });
      user.profile.name = profile.displayName;
      // Assign a temporary e-mail address
      // to get on with the registration process. It can be changed later
      // to a valid e-mail address in Profile Management.
      user.email = profile.id + "@email.com";
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  email = email.toLowerCase();
  User.findOne({ email: email }, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
 //add refresh to is authorized
exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};
