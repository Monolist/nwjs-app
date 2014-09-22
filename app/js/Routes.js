/**
 * @jsx React.DOM
 */
'use strict';

var Routes        = require('react-router').Routes;
var Route         = require('react-router').Route;
var NotFoundRoute = require('react-router').NotFoundRoute;
var App           = require('./App');
var HomePage      = require('./pages/HomePage');
var UserPage      = require('./pages/UserPage');
var NotFoundPage  = require('./pages/NotFoundPage');

module.exports = (
  <Routes location='history'>
    <Route path='/' handler={App}>
      <Route name='home' path='/' handler={HomePage} />
      <Route name='user' path='/user/:username' handler={UserPage} />
    </Route>
    <NotFoundRoute handler={NotFoundPage} />
  </Routes>
);