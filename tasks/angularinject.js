/*
 * angularinject
 * https://github.com/feige05/grunt-angularinject
 *
 * Copyright (c) 2014 Hufei
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('angularinject', 'Inject angular components into your source code.', function() {
    this.requiresConfig(['angularinject', this.target, 'src']);
    this.requiresConfig(['angularinject', this.target, 'cwd']);
    // Extend the options object with the entire data object (instead of just .src) for backward compatibility.
    require('../lib/angularinject')(this.options(this.data));
  });

};
