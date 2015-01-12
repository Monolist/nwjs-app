/** @jsx React.DOM */
'use strict';

var React         = require('react/addons');
var Router        = require('react-router');
var routes        = require('./Routes');
var os            = require('os');
var gui           = global.window.nwDispatcher.requireNwGui();
var app           = gui.App;
var win           = gui.Window.get();
var nativeMenuBar = new gui.Menu({ type: 'menubar' });
var macRegex      = new RegExp('mac', 'i');

app.clearCache();

if ( macRegex.test(os.platform()) || macRegex.test(os.release()) ) {
  nativeMenuBar.createMacBuiltin('Monolist');
  win.menu = nativeMenuBar;
}

if ( process.env.NODE_ENV !== 'production' ) {
  window.React = React; // Enable React devtools
}

Router.run(routes, Router.HistoryLocation, function(Handler, state) {
  React.render(<Handler params={state.params} query={state.query} />, document.getElementById('app'));
});