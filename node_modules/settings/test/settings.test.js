/*============================================================================
  Copyright(c) 2010 Mario L Gutierrez <mario@mgutz.com>
  MIT Licensed

  AUTO-GENERATED. DO NOT EDIT.
============================================================================*/
// Original file: src/test/settings.test.coffee
var Settings, assert, _settings;
assert = require('assert');
Settings = require('../lib');
_settings = new Settings(__dirname + '/config/environment');
module.exports = {
  "should be global installable using custom key": function() {
    var environments, settings;
    environments = {
      'common': {
        foo: 'boo'
      },
      'development': {
        foo: 'bar'
      }
    };
    settings = new Settings(environments, {
      globalKey: '$settings'
    }).getEnvironment('development');
    return assert.equal('bar', $settings.foo);
  },
  "should get specific environment": function() {
    var settings;
    settings = _settings.getEnvironment('development');
    assert.equal('server_dev', settings.storage.database);
    settings = _settings.getEnvironment();
    assert.equal('server_dev', settings.storage.database);
    settings = _settings.getEnvironment('test');
    assert.equal('server_test', settings.storage.database);
    settings = _settings.getEnvironment('production');
    return assert.equal('server_production', settings.storage.database);
  },
  "should get value from ancestor if key is not found": function() {
    var settings;
    settings = _settings.getEnvironment('test');
    return assert.equal('password', settings.storage.password);
  },
  "should have a forceEnv property to force all settings through an environment": function() {
    var environments, set, settings;
    environments = {
      'common': {
        foo: 'boo'
      },
      'development': {
        foo: 'bar'
      },
      'test': {
        foo: 'bah'
      },
      'prod': {
        foo: 'baz'
      },
      forceEnv: 'development'
    };
    settings = new Settings(environments);
    set = settings.getEnvironment('development');
    assert.equal('bar', set.foo);
    set = settings.getEnvironment('test');
    assert.equal('bar', set.foo);
    set = settings.getEnvironment('prod');
    return assert.equal('bar', set.foo);
  },
  "should replace array values, not merge them": function() {
    var environments, settings;
    environments = {
      'common': {
        arr: [1, 2, 3]
      },
      'development': {
        arr: [4, 5, 6]
      }
    };
    settings = new Settings(environments).getEnvironment('development');
    return assert.eql([4, 5, 6], settings.arr);
  },
  "should do a deep merge": function() {
    var environments, settings;
    environments = {
      'common': {
        a: {
          b: {
            c: {
              arr: [1, 2, 3],
              bah: 'baz'
            },
            bar: 'bar'
          }
        }
      },
      'development': {
        a: {
          b: {
            c: {
              arr: [4, 5, 6],
              fu: 'bot'
            }
          }
        }
      }
    };
    settings = new Settings(environments).getEnvironment('development');
    assert.eql([4, 5, 6], settings.a.b.c.arr);
    assert.eql('baz', settings.a.b.c.bah);
    assert.eql('bar', settings.a.b.bar);
    return assert.eql('bot', settings.a.b.c.fu);
  },
  "should say which environment is current": function() {
    var settings;
    settings = _settings.getEnvironment('development');
    assert.equal('development', _settings.env);
    settings = _settings.getEnvironment('test');
    return assert.equal('test', _settings.env);
  },
  "should accept defaults": function() {
    var environments, options, settings;
    environments = {
      'common': {
        foo: 'boo'
      },
      'development': {
        foo: 'bar'
      }
    };
    options = {
      globalKey: '$settings',
      defaults: {
        framework: {
          views: 'app/views',
          models: 'app/models'
        }
      }
    };
    settings = new Settings(environments, options).getEnvironment('development');
    return assert.equal('app/views', settings.framework.views);
  }
};
