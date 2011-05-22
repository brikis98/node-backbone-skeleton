(function() {
  NameSpace.FooView = Backbone.View.extend({
    events: {
      'click #foo': 'bar'
    }
  });
}).call(this);
