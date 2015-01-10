'use strict';

var gulp        = require('gulp');
var runSequence = require('run-sequence');

gulp.task('prod', ['clean'], function(callback) {

  callback = callback || function() {};

  global.isProd = true;

  runSequence(
    'sass',
    'imagemin',
    'browserify',
    'copyFonts',
    'copyIndex',
    'copyIcon',
    'cdnizer',
    'switchAPI',
    'modifyNwOptions',
    'nodeWebkit',
    'copyCodecs',
    'createInstallers',
    'deploy',
    callback
  );

});