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
      var _ref;
      this.options = options;
      this.templates = templates;
      this.handleFile = __bind(this.handleFile, this);
      this.paths = (_ref = this.options) != null ? _ref.paths : void 0;
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
        sampleRate = 1;
      }
      root = path.resolve(root);
      console.log("Watching for changes under root '" + root + "' to paths " + (JSON.stringify(_.keys(this.paths))));
      watcher = watchTree.watchTree(root, {
        'sample-rate': sampleRate
      });
      watcher.on('fileModified', __bind(function(file) {
        return this.handleFile(file, 'modify');
      }, this));
      watcher.on('fileCreated', __bind(function(file) {
        return this.handleFile(file, 'create');
      }, this));
      return watcher.on('fileDeleted', __bind(function(file) {
        return this.handleFile(file, 'delete');
      }, this));
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
        return console.error("stderr from '" + command + "': " + data);
      }, this));
      return child.on('exit', __bind(function(code) {
        this.log("'" + command + "' exited with code " + code);
        return typeof callback === "function" ? callback(code) : void 0;
      }, this));
    };
    Watcher.prototype.findMatch = function(file) {
      return _.detect(this.paths, __bind(function(value, pattern) {
        return this.globToRegExp(pattern).test(file);
      }, this));
    };
    Watcher.prototype.handleFile = function(file, action) {
      var match;
      match = this.findMatch(file);
      if (match) {
        return this.processFile(file, action, match);
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
    Watcher.prototype.processFile = function(file, action, options) {
      var success;
      console.log("Processing change in '" + file + "'");
      success = (__bind(function() {
        if (options.package) {
          return this.packageFiles(file);
        }
      }, this));
      switch (options.type) {
        case 'coffee':
          return this.compileCoffee(file, action, options.out, success);
        case 'template':
          return this.compileTemplate(file, action, options.out, success);
        default:
          return console.log("Unrecognized type '" + type + "', skipping file '" + file + "'");
      }
    };
    Watcher.prototype.compileCoffee = function(file, action, out, callback) {
      var coffeeName;
      coffeeName = path.basename(file, path.extname(file));
      if (action === 'delete') {
        this.log("Handling delete of CoffeeScript file ''" + file + "'");
        return this.deleteFile(this.outFile(out, coffeeName, 'js'), callback);
      } else {
        this.log("Compiling CoffeeScript file '" + file + "' to '" + out + "'");
        return this.spawn('coffee', ['--output', out, '--compile', file], callback);
      }
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
    Watcher.prototype.deleteFile = function(file, callback) {
      return fs.unlink(file, __bind(function(err) {
        if (err) {
          return this.log("Couldn't delete file '" + file + "': " + (JSON.stringify(err)));
        }
        console.log("Calling callback " + callback);
        return typeof callback === "function" ? callback() : void 0;
      }, this));
    };
    Watcher.prototype.processTemplatePattern = function(pattern, value) {
      if (value.type !== 'template') {
        return;
      }
      return glob.glob(pattern, __bind(function(err, matches) {
        var match, _i, _len, _results;
        if (err) {
          return console.log("" + err);
        }
        _results = [];
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          match = matches[_i];
          _results.push(this.compileTemplate(match, 'create', value.out));
        }
        return _results;
      }, this));
    };
    Watcher.prototype.compileTemplate = function(file, action, out, callback) {
      var templateName;
      templateName = path.basename(file, path.extname(file));
      if (action === 'delete') {
        this.log("Handling delete of template '" + file + "'");
        return this.deleteFile(this.outFile(out, templateName, 'js'), callback);
      } else {
        this.log("Compiling template file '" + file + "' to '" + out + "' and adding it to templates object");
        return fs.readFile(file, 'utf8', __bind(function(err, data) {
          var compiled;
          if (err) {
            return console.log(err);
          }
          compiled = _.template(data);
          this.templates[templateName] = compiled;
          if (out) {
            return this.writeTemplate(templateName, compiled, out, callback);
          }
        }, this));
      }
    };
    Watcher.prototype.outFile = function(outDir, filename, ext) {
      return path.join(outDir, "" + filename + "." + ext);
    };
    Watcher.prototype.writeTemplate = function(templateName, compiled, out, callback) {
      var asString;
      asString = compiled.toString().replace('function anonymous', "window.templates || (window.templates = {});\nwindow.templates['" + templateName + "'] = function") + ';';
      return fileUtil.mkdirs(out, 0755, __bind(function() {
        return fs.writeFile(this.outFile(out, templateName, 'js'), asString, 'utf8', callback);
      }, this));
    };
    Watcher.prototype.packageFiles = function(file) {
      this.log('Packaging files using jammit');
      return this.spawn('jammit', ['-c', this.options.package, '-o', this.options.packageOut]);
    };
    Watcher.prototype.log = function(message) {
      var _ref;
      if ((_ref = this.options) != null ? _ref.verbose : void 0) {
        return console.log(message);
      }
    };
    return Watcher;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    exports.watcher = Watcher;
  }
}).call(this);
