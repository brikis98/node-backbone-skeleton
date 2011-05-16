class Foo
  constructor: (@bar) ->
    
  explain: ->
    console.log 'Put your own custom libraries/classes in this package'
    
NameSpace.Foo = Foo # Add them to your namespace