#
# Copyright(c) 2010 Mario L Gutierrez <mario@mgutz.com>
# MIT Licensed
#

assert = require('assert')
merger = require('../support/merger')

# TODO - add watcher on settings file

# Provides settings from an environment file or an object.
#
# The settings module must export, at a minimum, a `common` property.
#
# Other environments are deep merged into `common`.
#
# @param {String | Object} pathOrModule The file to load or an object.
#
# @example
#
# exports.common = {connectionString: 'mysql_dev'};
#
# exports.development = {};
# exports.test = {connectionString: 'mysql_test'};
#
# development.connectionString === 'mysql_dev';
# test.connectionString === 'mysql_test';
#
Settings = (pathOrModule, @options = {}) ->
  self = this

  if typeof pathOrModule == 'string'
    @path = pathOrModule
    @environments = require(pathOrModule)
  else
    @environments = pathOrModule

  if @options.globalKey?
    global.__defineGetter__ @options.globalKey, ->
      self.environments[self.env]

  this


# Get settings for a specific environment.
#
# @param {String} environ [optional] The environment to retrieve.
#
# If `environ` is not passed, an environment is selected in this order
#
#  1. Module's `forceEnv` property
#  2. $NODE_ENV environment variable
#  3. `common` environment
# 
Settings.prototype.getEnvironment = (environ) ->
  @env = @environments.forceEnv || environ || process.env.NODE_ENV || 'common'
  
  assert.ok @environments.common, 'Environment common not found in: ' + @path
  assert.ok @environments[@env], 'Environment `' + @env + '` not found in: ' + @path

  if @options.defaults?
    common = merger.cloneextend(@options.defaults, @environments.common)
  else
    common = merger.clone(@environments.common)

  if @env == 'common'
    common
  else
    merger.extend common, @environments[@env]


module.exports = Settings
