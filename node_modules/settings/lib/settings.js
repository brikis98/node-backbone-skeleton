/*============================================================================
  Copyright(c) 2010 Mario L Gutierrez <mario@mgutz.com>
  MIT Licensed

  AUTO-GENERATED. DO NOT EDIT.
============================================================================*/
// Original file: src/lib/settings.coffee
var Settings, assert, merger;
assert = require('assert');
merger = require('../support/merger');
Settings = function(pathOrModule, options) {
  var self;
  this.options = options != null ? options : {};
  self = this;
  if (typeof pathOrModule === 'string') {
    this.path = pathOrModule;
    this.environments = require(pathOrModule);
  } else {
    this.environments = pathOrModule;
  }
  if (this.options.globalKey != null) {
    global.__defineGetter__(this.options.globalKey, function() {
      return self.environments[self.env];
    });
  }
  return this;
};
Settings.prototype.getEnvironment = function(environ) {
  var common;
  this.env = this.environments.forceEnv || environ || process.env.NODE_ENV || 'common';
  assert.ok(this.environments.common, 'Environment common not found in: ' + this.path);
  assert.ok(this.environments[this.env], 'Environment `' + this.env + '` not found in: ' + this.path);
  if (this.options.defaults != null) {
    common = merger.cloneextend(this.options.defaults, this.environments.common);
  } else {
    common = merger.clone(this.environments.common);
  }
  if (this.env === 'common') {
    return common;
  } else {
    return merger.extend(common, this.environments[this.env]);
  }
};
module.exports = Settings;
