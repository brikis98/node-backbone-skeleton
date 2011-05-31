(function() {
  var Settings, Watcher, app, express, path, settings, templates, watcher, _;
  express = require('express');
  path = require('path');
  _ = require('underscore');
  Watcher = require('./util/watcher').watcher;
  Settings = require('settings');
  templates = {};
  settings = new Settings(path.join(__dirname, 'config/environment.js')).getEnvironment();
  watcher = new Watcher(settings.watcherOptions, templates);
  watcher.compileTemplates();
  app = express.createServer();
  app.configure(function() {
    app.use(express.cookieParser({
      maxAge: settings.cookieMaxAge
    }));
    return app.use(express.session({
      secret: settings.cookieSecret
    }));
  });
  app.configure('development', function() {
    app.use(express.static(settings.publicDir));
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return watcher.watch();
  });
  app.configure('production', function() {
    app.use(express.static(settings.publicDir, {
      maxAge: settings.staticMaxAge
    }));
    return app.use(express.errorHandler());
  });
  app.get('/', function(req, res) {
    return res.send(templates['index']({
      name: 'Jim'
    }));
  });
  app.listen(8003);
}).call(this);
