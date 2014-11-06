'use strict';

var React = require('react');

module.exports = function(component, props, contextStubs) {

  function merge(obj1, obj2) {
    var obj3 = {};
    var attrname;

    for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }

    return obj3;
  }

  var TestWrapper = React.createClass({
    childContextTypes: {
      currentPath: React.PropTypes.string,
      makePath: React.PropTypes.func.isRequired,
      makeHref: React.PropTypes.func.isRequired,
      transitionTo: React.PropTypes.func.isRequired,
      replaceWith: React.PropTypes.func.isRequired,
      goBack: React.PropTypes.func.isRequired,
      isActive: React.PropTypes.func.isRequired,
      activeRoutes: React.PropTypes.array.isRequired,
      activeParams: React.PropTypes.object.isRequired,
      activeQuery: React.PropTypes.object.isRequired,
      location: React.PropTypes.object,
      routes: React.PropTypes.array.isRequired,
      namedRoutes: React.PropTypes.object.isRequired,
      scrollBehavior: React.PropTypes.object
    },

    getChildContext: function() {
      return merge({
        currentPath: '__STUB__',
        makePath: function() {},
        makeHref: function() { return '__STUB__'; },
        transitionTo: function() {},
        replaceWith: function() {},
        goBack: function() {},
        isActive: function() {},
        activeRoutes: [],
        activeParams: {},
        activeQuery: {},
        location: {},
        routes: [],
        namedRoutes: {},
        scrollBehavior: {}
      }, contextStubs);
    },

    render: function() {
      this.props.ref = '__subject__';
      return component(this.props);
    }
  });

  return TestWrapper(props);

};