(function() {
  var Watcher, child_process, fileUtil, fs, glob, path, watchTree, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require('fs');
  fileUtil = require('file');
  path = require('path');
  watchTree = require('watch-tree');
  child_process = require('child_process');
  _ = require('underscore');
  glob = require('glob');
  Watcher = (function() {
    function Watcher(options, templates) {
      this.options = options;
      this.templates = templates;
      this.handleFile = __bind(this.handleFile, this);
      this.paths = this.options.paths;
    }
    Watcher.prototype.watch = function() {
      if (this.options.compass) {
        this.runCompass(this.options.compass);
      }
      if (this.paths) {
        return this.watchTree(this.options.root, this.options.sampleRate);
      }
    };
    Watcher.prototype.watchTree = function(root, sampleRate) {
      var watcher;
      if (root == null) {
        root = '.';
      }
      if (sampleRate == null) {
        sampleRate = 5;
      }
      root = path.resolve(root);
      console.log("Watching for changes under root '" + root + "' to paths " + (JSON.stringify(_.keys(this.paths))));
      watcher = watchTree.watchTree(root, {
        'sample-rate': sampleRate
      });
      watcher.on('fileModified', this.handleFile);
      return watcher.on('fileCreated', this.handleFile);
    };
    Watcher.prototype.runCompass = function(config) {
      console.log("Starting compass with config file '" + config + "'");
      return this.spawn('compass', ['watch', '-c', config]);
    };
    Watcher.prototype.spawn = function(command, args, callback) {
      var child;
      child = child_process.spawn(command, args);
      child.stdout.on('data', __bind(function(data) {
        return this.log("stdout from '" + command + "': " + data);
      }, this));
      child.stderr.on('data', __bind(function(data) {
        return console.log("stderr from '" + command + "': " + data);
      }, this));
      return child.on('exit', __bind(function(code) {
        this.log("'" + command + "' exited with code " + code);
        if (callback) {
          return callback(code);
        }
      }, this));
    };
    Watcher.prototype.handleFile = function(file) {
      var match;
      match = _.detect(this.paths, __bind(function(value, pattern) {
        return this.globToRegExp(pattern).test(file);
      }, this));
      if (match) {
        return this.processFile(file, match);
      }
    };
    Watcher.prototype.globToRegExp = function(glob) {
      var regex;
      regex = glob.replace(/\./g, '\\.');
      regex = regex.replace(/\?/g, '.');
      regex = regex.replace(/\*/g, '.*');
      regex = regex.replace(/\.\*\.\*\//g, '(.*\/)*');
      return new RegExp(regex);
    };
    Watcher.prototype.processFile = function(file, options) {
      console.log("Processing change in '" + file + "'");
      switch (options.type) {
        case 'coffee':
          this.compileCoffee(file, options.out);
          break;
        case 'template':
          this.compileTemplate(file, options.out);
          break;
        default:
          console.log("Unrecognized type '" + type + "', skipping file '" + file + "'");
      }
      if (options.package) {
        return this.packageFiles(file);
      }
    };
    Watcher.prototype.compileCoffee = function(file, out) {
      this.log("Compiling CoffeeScript file '" + file + "' to '" + out + "'");
      return this.spawn('coffee', ['--output', out, '--compile', file]);
    };
    Watcher.prototype.compileTemplates = function() {
      var pattern, value, _ref, _results;
      this.log("Compiling all templates");
      _ref = this.paths;
      _results = [];
      for (pattern in _ref) {
        value = _ref[pattern];
        _results.push(this.processTemplatePattern(pattern, value));
      }
      return _results;
    };
    Watcher.prototype.processTemplatePattern = function(pattern, value) {
      if (value.type !== 'template') {
        return;
      }
      return glob.glob(pattern, __bind(function(err, matches) {
        var match, _i, _len, _results;
        if (err) {
          console.log("" + err);
        }
        _results = [];
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          match = matches[_i];
          _results.push(this.compileTemplate(match, value.out));
        }
        return _results;
      }, this));
    };
    Watcher.prototype.compileTemplate = function(file, out) {
      var templateName;
      this.log("Compiling template file '" + file + "' to '" + out + "' and adding it to templates object");
      templateName = path.basename(file, path.extname(file));
      return fs.readFile(file, 'utf8', __bind(function(err, data) {
        var compiled;
        if (err) {
          return console.log(err);
        }
        compiled = _.template(data);
        this.templates[templateName] = compiled;
        if (out) {
          return this.writeTemplate(templateName, compiled, out);
        }
      }, this));
    };
    Watcher.prototype.writeTemplate = function(templateName, compiled, out) {
      var asString;
      asString = compiled.toString().replace('function anonymous', "window.templates || (window.templates = {});\nwindow.templates." + templateName + " = function") + ';';
      return fileUtil.mkdirs(out, 0755, __bind(function() {
        return fs.writeFile(path.join(out, "" + templateName + ".js"), asString, 'utf8');
      }, this));
    };
    Watcher.prototype.packageFiles = function(file) {
      this.log('Packaging files using jammit');
      return this.spawn('jammit', ['-c', this.options.package, '-o', this.options.packageOut]);
    };
    Watcher.prototype.log = function(message) {
      if (this.options.verbose) {
        return console.log(message);
      }
    };
    return Watcher;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.watcher = Watcher;
  }
}).call(this);
