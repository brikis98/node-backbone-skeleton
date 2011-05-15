express   = require 'express'
path      = require 'path'
_         = require 'underscore'
watch     = require './util/watch'
PUBLIC    = './public'
templates = {}

_.templateSettings = 
  interpolate: /\{(.+?)\}/g

app = express.createServer()

app.configure 'development', ->
  app.use express.static(path.join(__dirname, PUBLIC))
  app.use express.errorHandler(dumpExceptions: true, showStack: true)
  watch.watch templates, _, 'templates', 'compiled', '.html', true

app.configure 'production', ->
  oneYear = 1000 * 60 * 60 * 24 * 365
  app.use express.static(path.join(__dirname, PUBLIC), maxAge: oneYear)
  app.use express.errorHandler() 
  watch.watch templates, _, 'templates', 'compiled', '.html', false

app.get '/', (req, res) ->
  res.send templates['index'] {}
  
app.listen 8003