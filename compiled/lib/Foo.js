(function() {
  var Foo;
  Foo = (function() {
    function Foo(bar) {
      this.bar = bar;
    }
    Foo.prototype.explain = function() {
      return console.log('Put your own custom libraries/classes in this package');
    };
    return Foo;
  })();
  NameSpace.Foo = Foo;
}).call(this);
