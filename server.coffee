express   = require 'express'
path      = require 'path'
_         = require 'underscore'
Watcher   = require('./util/watcher').watcher
PUBLIC    = './public'
templates = {}

_.templateSettings = 
  interpolate: /\{(.+?)\}/g

watcherOptions = 
  compass: 'config/config.rb'
  verbose: true
  templates: templates
  package: 'config/jammit.yml'
  packageOut: 'public/js'
  paths:
    'server\\.coffee':                  {type: 'coffee', out: '.'}
    'templates/.+\\.html':              {type: 'template', out: 'compiled/templates', package: true}
    'util/.+\\.coffee':                 {type: 'coffee', out: 'util'}
    'bootstrap/.+\\.coffee':            {type: 'coffee', out: 'compiled/bootstrap', package: true}
    'models/.+\\.coffee':               {type: 'coffee', out: 'compiled/models', package: true}
    'controllers/.+\\.coffee':          {type: 'coffee', out: 'compiled/controllers', package: true}
    'views/.+\\.coffee':                {type: 'coffee', out: 'compiled/views', package: true}        
    'lib/.+\\.coffee':                  {type: 'coffee', out: 'compiled/lib', package: true}

app = express.createServer()
watcher = new Watcher watcherOptions

app.configure 'development', ->
  app.use express.static(path.join(__dirname, PUBLIC))
  app.use express.errorHandler(dumpExceptions: true, showStack: true)
  watcher.watch()
  
app.configure 'production', ->
  oneYear = 1000 * 60 * 60 * 24 * 365
  app.use express.static(path.join(__dirname, PUBLIC), maxAge: oneYear)
  app.use express.errorHandler()

watcher.compileTemplates 'templates', '.html', 'compiled/templates'

app.get '/', (req, res) ->
  res.send templates['index']()
  
app.listen 8003