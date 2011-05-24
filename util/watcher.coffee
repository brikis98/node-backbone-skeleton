fs            = require 'fs'
fileUtil      = require 'file'
path          = require 'path'
watchTree     = require 'watch-tree'
child_process = require 'child_process'
_             = require 'underscore'
glob          = require 'glob'

class Watcher
  constructor: (@options, @templates) ->
    @paths = @options.paths
    
  watch: ->
    @runCompass @options.compass if @options.compass
    @watchTree @options.root, @options.sampleRate if @paths
  
  watchTree: (root = '.', sampleRate = 5) -> 
    root = path.resolve root
    console.log "Watching for changes under root '#{root}' to paths #{JSON.stringify _.keys @paths}"
    
    watcher = watchTree.watchTree root, {'sample-rate': sampleRate}
    watcher.on('fileModified', @handleFile)
    watcher.on('fileCreated', @handleFile)
  
  runCompass: (config) ->
    console.log "Starting compass with config file '#{config}'"
    @spawn 'compass', ['watch', '-c',  config]
  
  spawn: (command, args, callback) ->
    child = child_process.spawn command, args
    child.stdout.on 'data', (data) =>
      @log "stdout from '#{command}': #{data}"
    child.stderr.on 'data', (data) =>
      console.log "stderr from '#{command}': #{data}"      
    child.on 'exit', (code) =>
      @log "'#{command}' exited with code #{code}"
      callback code if callback
      
  handleFile: (file) => 
    # glob.fnmatch does not behave as expected, so use RegExp instead
    match = _.detect @paths, (value, pattern) =>     
      @globToRegExp(pattern).test file
    @processFile file, match if match
  
  globToRegExp: (glob) ->
    regex = glob.replace /\./g, '\\.'                 # escape dots
    regex = regex.replace /\?/g, '.'                  # replace ? with dots
    regex = regex.replace /\*/g, '.*'                 # replace * with .*
    regex = regex.replace /\.\*\.\*\//g, '(.*\/)*'    # replace .*.*/ (which used to be **/) with (.*/)*
    new RegExp regex
    
  processFile: (file, options) ->
    console.log "Processing change in '#{file}'"
    switch options.type
      when 'coffee' then @compileCoffee file, options.out
      when 'template' then @compileTemplate file, options.out
      else console.log "Unrecognized type '#{type}', skipping file '#{file}'"
    @packageFiles file if options.package
    
  compileCoffee: (file, out) ->
    @log "Compiling CoffeeScript file '#{file}' to '#{out}'"
    @spawn 'coffee', ['--output', out, '--compile', file]
    
  compileTemplates: ->
    @log "Compiling all templates"  

    @processTemplatePattern(pattern, value) for pattern, value of @paths
  
  processTemplatePattern: (pattern, value) ->
    return if value.type != 'template'
    
    glob.glob pattern, (err, matches) =>
      console.log "#{err}" if err
      for match in matches
        @compileTemplate match, value.out    
    
  compileTemplate: (file, out) ->
    @log "Compiling template file '#{file}' to '#{out}' and adding it to templates object"

    templateName = path.basename file, path.extname(file)
    fs.readFile file, 'utf8', (err, data) =>
      return console.log(err) if err
      compiled = _.template data 
      @templates[templateName] = compiled
      @writeTemplate(templateName, compiled, out) if out
  
  writeTemplate: (templateName, compiled, out) ->
    asString = compiled.toString().replace('function anonymous', "window.templates || (window.templates = {});\nwindow.templates.#{templateName} = function") + ';'      
    fileUtil.mkdirs out, 0755,  =>      
      fs.writeFile path.join(out, "#{templateName}.js"), asString, 'utf8'
  
  packageFiles: (file) ->
    @log 'Packaging files using jammit'
    @spawn 'jammit', ['-c', @options.package, '-o', @options.packageOut]
  
  log: (message) ->
    console.log message if @options.verbose    
      
exports?.watcher = Watcher