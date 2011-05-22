(function() {
  var PUBLIC, Watcher, app, express, path, templates, watcher, watcherOptions, _;
  express = require('express');
  path = require('path');
  _ = require('underscore');
  Watcher = require('./util/watcher').watcher;
  PUBLIC = './public';
  templates = {};
  _.templateSettings = {
    interpolate: /\{(.+?)\}/g
  };
  watcherOptions = {
    compass: 'config/config.rb',
    verbose: true,
    templates: templates,
    package: 'config/jammit.yml',
    packageOut: 'public/js',
    paths: {
      'server\\.coffee': {
        type: 'coffee',
        out: '.'
      },
      'templates/.+\\.html': {
        type: 'template',
        out: 'compiled/templates',
        package: true
      },
      'util/.+\\.coffee': {
        type: 'coffee',
        out: 'util'
      },
      'bootstrap/.+\\.coffee': {
        type: 'coffee',
        out: 'compiled/bootstrap',
        package: true
      },
      'models/.+\\.coffee': {
        type: 'coffee',
        out: 'compiled/models',
        package: true
      },
      'controllers/.+\\.coffee': {
        type: 'coffee',
        out: 'compiled/controllers',
        package: true
      },
      'views/.+\\.coffee': {
        type: 'coffee',
        out: 'compiled/views',
        package: true
      },
      'lib/.+\\.coffee': {
        type: 'coffee',
        out: 'compiled/lib',
        package: true
      }
    }
  };
  app = express.createServer();
  watcher = new Watcher(watcherOptions);
  app.configure('development', function() {
    app.use(express.static(path.join(__dirname, PUBLIC)));
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return watcher.watch();
  });
  app.configure('production', function() {
    var oneYear;
    oneYear = 1000 * 60 * 60 * 24 * 365;
    app.use(express.static(path.join(__dirname, PUBLIC), {
      maxAge: oneYear
    }));
    return app.use(express.errorHandler());
  });
  watcher.compileTemplates('templates', '.html', 'compiled/templates');
  app.get('/', function(req, res) {
    return res.send(templates['index']());
  });
  app.listen(8003);
}).call(this);
