fs            = require 'fs'
fileUtil      = require 'file'
path          = require 'path'
watchTree     = require 'watch-tree'
child_process = require 'child_process'
_             = require 'underscore'
glob          = require 'glob'

class Watcher
  constructor: (@options, @templates) ->
    @paths = @options?.paths
    
  watch: ->
    @runCompass @options.compass if @options.compass
    @watchTree @options.root, @options.sampleRate if @paths
  
  watchTree: (root = '.', sampleRate = 1) -> 
    root = path.resolve root
    console.log "Watching for changes under root '#{root}' to paths #{JSON.stringify _.keys @paths}"
    
    watcher = watchTree.watchTree root, {'sample-rate': sampleRate}
    watcher.on 'fileModified', (file) => @handleFile(file, 'modify')
    watcher.on 'fileCreated', (file) => @handleFile(file, 'create')
    watcher.on 'fileDeleted', (file) => @handleFile(file, 'delete')
  
  runCompass: (config) ->
    console.log "Starting compass with config file '#{config}'"
    @spawn 'compass', ['watch', '-c',  config]
  
  spawn: (command, args, callback) ->
    child = child_process.spawn command, args
    child.stdout.on 'data', (data) =>
      @log "stdout from '#{command}': #{data}"
    child.stderr.on 'data', (data) =>
      console.error "stderr from '#{command}': #{data}"      
    child.on 'exit', (code) =>
      @log "'#{command}' exited with code #{code}"
      callback?(code)
  
  findMatch: (file) ->
    _.detect @paths, (value, pattern) => @globToRegExp(pattern).test file
      
  handleFile: (file, action) => 
    # glob.fnmatch does not behave as expected, so use RegExp instead
    match = @findMatch file
    @processFile file, action, match if match
  
  globToRegExp: (glob) ->
    regex = glob.replace /\./g, '\\.'                 # escape dots
    regex = regex.replace /\?/g, '.'                  # replace ? with dots
    regex = regex.replace /\*/g, '.*'                 # replace * with .*
    regex = regex.replace /\.\*\.\*\//g, '(.*\/)*'    # replace .*.*/ (which used to be **/) with (.*/)*
    new RegExp regex
    
  processFile: (file, action, options) ->
    console.log "Processing change in '#{file}'"
    success = (=> @packageFiles(file) if options.package)
    switch options.type
      when 'coffee' then @compileCoffee file, action, options.out, success
      when 'template' then @compileTemplate file, action, options.out, success
      else console.log "Unrecognized type '#{type}', skipping file '#{file}'"
    
  compileCoffee: (file, action, out, callback) ->
    coffeeName = path.basename file, path.extname(file)
    if action == 'delete'
      @log "Handling delete of CoffeeScript file ''#{file}'"
      @deleteFile @outFile(out, coffeeName, 'js'), callback
    else
      @log "Compiling CoffeeScript file '#{file}' to '#{out}'"    
      @spawn 'coffee', ['--output', out, '--compile', file], callback
    
  compileTemplates: ->
    @log "Compiling all templates"  
    @processTemplatePattern(pattern, value) for pattern, value of @paths
  
  deleteFile: (file, callback) ->    
    fs.unlink file, (err) =>
      return @log "Couldn't delete file '#{file}': #{JSON.stringify err}" if err
      console.log "Calling callback #{callback}"
      callback?()
  
  processTemplatePattern: (pattern, value) ->
    return if value.type != 'template'
    
    glob.glob pattern, (err, matches) =>
      return console.log "#{err}" if err
      for match in matches
        @compileTemplate match, 'create', value.out    
    
  compileTemplate: (file, action, out, callback) ->
    templateName = path.basename file, path.extname(file)
    if action == 'delete'
      @log "Handling delete of template '#{file}'"
      @deleteFile @outFile(out, templateName, 'js'), callback
    else
      @log "Compiling template file '#{file}' to '#{out}' and adding it to templates object"    
      fs.readFile file, 'utf8', (err, data) =>
        return console.log(err) if err
        compiled = _.template data 
        @templates[templateName] = compiled
        @writeTemplate(templateName, compiled, out, callback) if out
  
  outFile: (outDir, filename, ext) ->
    path.join(outDir, "#{filename}.#{ext}")
  
  writeTemplate: (templateName, compiled, out, callback) ->
    asString = compiled.toString().replace('function anonymous', "window.templates || (window.templates = {});\nwindow.templates['#{templateName}'] = function") + ';'      
    fileUtil.mkdirs out, 0755,  =>      
      fs.writeFile @outFile(out, templateName, 'js'), asString, 'utf8', callback
  
  packageFiles: (file) ->
    @log 'Packaging files using jammit'
    @spawn 'jammit', ['-c', @options.package, '-o', @options.packageOut]
  
  log: (message) ->
    console.log message if @options?.verbose    
      
exports?.watcher = Watcher