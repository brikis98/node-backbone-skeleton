express   = require 'express'
path      = require 'path'
_         = require 'underscore'
Watcher   = require('./util/watcher').watcher
Settings  = require 'settings'

templates      = {}
settings       = new Settings(path.join __dirname, 'config/environment.js').getEnvironment()
watcher        = new Watcher settings.watcherOptions, templates

watcher.compileTemplates()

app = express.createServer()

app.configure ->
  app.use express.cookieParser maxAge: settings.cookieMaxAge
  app.use express.session secret: settings.cookieSecret

app.configure 'development', ->
  app.use express.static(settings.publicDir)
  app.use express.errorHandler(dumpExceptions: true, showStack: true)
  watcher.watch()
  
app.configure 'production', ->
  app.use express.static(settings.publicDir, maxAge: settings.staticMaxAge)
  app.use express.errorHandler()

app.get '/', (req, res) ->
  res.send templates['index']({name: 'Jim'})
  
app.listen 8003