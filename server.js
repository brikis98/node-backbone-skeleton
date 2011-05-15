(function() {
  var PUBLIC, app, express, path, templates, watch, _;
  express = require('express');
  path = require('path');
  _ = require('underscore');
  watch = require('./util/watch');
  PUBLIC = './public';
  templates = {};
  _.templateSettings = {
    interpolate: /\{(.+?)\}/g
  };
  app = express.createServer();
  app.configure('development', function() {
    app.use(express.static(path.join(__dirname, PUBLIC)));
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return watch.watch(templates, _, 'templates', 'compiled', '.html', true);
  });
  app.configure('production', function() {
    var oneYear;
    oneYear = 1000 * 60 * 60 * 24 * 365;
    app.use(express.static(path.join(__dirname, PUBLIC), {
      maxAge: oneYear
    }));
    app.use(express.errorHandler());
    return watch.watch(templates, _, 'templates', 'compiled', '.html', false);
  });
  app.get('/', function(req, res) {
    return res.send('hi');
  });
  app.listen(8003);
}).call(this);
