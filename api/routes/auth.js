'use strict';

var when     = require('when');
var _        = require('lodash');
var passport = require('passport');
var bcrypt   = require('bcrypt');
var models   = require('../models');
var mailer   = require('../mailer');

/* ====================================================== */

exports.isAuthenticated = function(req, res, next) {

  if ( req.isAuthenticated() || (req.session && req.session.user) ) {
    return next();
  } else {
    return res.status(401).json({
      error: 'User must be logged in.'
    });
  }

};

/* ====================================================== */

exports.isAdmin = function(req, res, next) {

  if ( req.user && req.user.role === 'admin' ) {
    return next();
  } else {
    return res.status(401).json({
      error: 'User must be an admin.'
    });
  }

};

/* ====================================================== */

exports.register = function(req, res) {

  var createUser = function(user) {
    var deferred = when.defer();

    user = {
      username: user.username || user.Username,
      email: user.email || user.Email,
      password: user.password || user.Password
    };

    models.User.create(user).then(function(savedUser) {
      deferred.resolve(savedUser);
    }).catch(function(err) {
      console.log('error creating user:', err);
      deferred.reject({
        status: 500,
        error: err
      });
    });

    return deferred.promise;
  };

  createUser(req.body).then(function(user) {
    res.status(200).json(user);
    // mailer.sendActivation(user).then(function() {
    //   res.status(200).json(user);
    // });
  }).catch(function(err) {
    res.status(err.status).json({
      error: err.error
    });
  });

};

/* ====================================================== */

exports.login = function(req, res, next) {

  passport.authenticate('local', function(err, user) {
    if ( err ) {
      return next(err);
    } else if ( _.isEmpty(user) ) {
      return res.status(401).json({
        error: 'Authentication failed.'
      });
    } else {
      req.login(user, function(err) {
        if ( err ) {
          return next(err);
        } else {
          req.session.cookie.maxAge = 1000*60*60*24*7; // seven days
          return res.status(200).json(user);
        }
      });
    }
  })(req, res, next);

};

/* ====================================================== */

exports.forgotPassword = function(req, res) {

  var updateUser = function(username) {
    var deferred = when.defer();

    models.User.find({
      where: { username: username }
    }).then(function(retrievedUser) {
      if ( !_.isEmpty(retrievedUser) ) {
        retrievedUser.updateAttributes({
          passwordResetKey: bcrypt.genSaltSync(5)
        }).then(function(user) {
          deferred.resolve(user);
        }).catch(function(err) {
          deferred.reject({
            status: 500,
            error: err
          });
        });
      } else {
        deferred.reject({
          status: 404,
          error: 'User could not be found matching that username.'
        });
      }
    }).catch(function(err) {
      deferred.reject({
        status: 500,
        error: err
      });
    });

    return deferred.promise;
  };

  updateUser(req.params.username).then(function(resp) {
    res.status(200).json(resp);
  }).catch(function(err) {
    res.status(err.status).json({
      error: err.error
    });
  });

};

/* ====================================================== */

exports.resetPassword = function(req, res) {

  var updateUser = function(userId, resetKey, password) {
    var deferred = when.defer();

    models.User.find({
      where: { id: userId, passwordResetKey: resetKey }
    }).then(function(retrievedUser) {
      if ( !_.isEmpty(retrievedUser) ) {
        retrievedUser.updateAttributes({
          passwordResetKey: null,
          password: password
        }).then(function(user) {
          deferred.resolve(user);
        }).catch(function(err) {
          deferred.reject({
            status: 500,
            error: err
          });
        });
      } else {
        deferred.reject({
          status: 404,
          error: 'User could not be found matching that user ID and password reset key.'
        });
      }
    }).catch(function(err) {
      deferred.reject({
        status: 500,
        error: err
      });
    });

    return deferred.promise;
  };

  updateUser(req.params.id, req.params.key, req.body.password).then(function(resp) {
    res.status(200).json(resp);
  }).catch(function(err) {
    res.status(err.status).json({
      error: err.error
    });
  });

};

/* ====================================================== */

exports.logout = function(req, res) {

  req.logout();
  res.status(200).json({
    message: 'User successfully logged out.'
  });

};