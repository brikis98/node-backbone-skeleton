express   = require 'express'
path      = require 'path'
_         = require 'underscore'
Watcher   = require('./util/watcher').watcher
templates = {}
Settings  = require 'settings'

settings = new Settings(path.join __dirname, '/config/environment.js').getEnvironment()
watcher = new Watcher settings.watcherOptions, templates

app = express.createServer()

app.configure 'development', ->
  app.use express.static(settings.publicDir)
  app.use express.errorHandler(dumpExceptions: true, showStack: true)
  watcher.watch()
  
app.configure 'production', ->
  oneYear = 1000 * 60 * 60 * 24 * 365
  app.use express.static(settings.publicDir, maxAge: oneYear)
  app.use express.errorHandler()

watcher.compileTemplates settings.templatesDir, settings.templatesExtension, settings.templatesOut

app.get '/', (req, res) ->
  res.send templates['index']({name: 'Jim'})
  
app.listen 8003