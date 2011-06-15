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
  app.use express.errorHandler settings.errorHandling
  app.use express.static settings.publicDir, maxAge: settings.staticMaxAge
  app.use express.bodyParser()
  app.use express.cookieParser maxAge: settings.cookieMaxAge
  app.use express.session secret: settings.cookieSecret

app.configure 'development', ->
  watcher.watch()
  
app.get '/', (req, res) ->
  res.send templates['index']({name: 'Jim'})
  
app.listen 8003