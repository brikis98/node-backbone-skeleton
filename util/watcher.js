(function() {
  var Watcher, child_process, fileUtil, fs, path, watchTree, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require('fs');
  fileUtil = require('file');
  path = require('path');
  watchTree = require('watch-tree');
  child_process = require('child_process');
  _ = require('underscore');
  Watcher = (function() {
    function Watcher(options) {
      this.options = options;
      this.handleFile = __bind(this.handleFile, this);
    }
    Watcher.prototype.watch = function() {
      if (this.options.compass) {
        this.runCompass(this.options.compass);
      }
      if (this.options.paths) {
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
      console.log("Watching for changes under root '" + root + "' to paths " + (JSON.stringify(_.keys(this.options.paths))));
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
    Watcher.prototype.handleFile = function(file, stats) {
      var match;
      match = _.detect(this.options.paths, __bind(function(value, key) {
        return new RegExp(key).test(file);
      }, this));
      if (match) {
        return this.processFile(file, match);
      }
    };
    Watcher.prototype.processFile = function(file, options) {
      console.log("Processing change at '" + file + "'");
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
    Watcher.prototype.compileTemplates = function(templateDir, templateExtension, out) {
      var template, templates, _i, _len, _results;
      this.log("Compiling all templates under '" + templateDir + "' to '" + out + "'");
      templates = fs.readdirSync(templateDir);
      _results = [];
      for (_i = 0, _len = templates.length; _i < _len; _i++) {
        template = templates[_i];
        _results.push(path.extname(template) === templateExtension ? this.compileTemplate(path.join(templateDir, template), out) : void 0);
      }
      return _results;
    };
    Watcher.prototype.compileTemplate = function(file, out) {
      var asString, compiled, templateName;
      this.log("Compiling template file '" + file + "' to '" + out + "' and adding it to templates object");
      templateName = path.basename(file, path.extname(file));
      compiled = _.template(fs.readFileSync(file, 'UTF-8'));
      this.options.templates[templateName] = compiled;
      asString = compiled.toString().replace('function anonymous', "window.templates || (window.templates = {});\nwindow.templates." + templateName + " = function") + ';';
      return fileUtil.mkdirs(out, 0755, __bind(function() {
        return fs.writeFileSync(path.join(out, "" + templateName + ".js"), asString);
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
