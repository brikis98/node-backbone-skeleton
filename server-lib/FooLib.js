(function() {
  var FooLib;
  FooLib = (function() {
    function FooLib() {}
    FooLib.prototype.foo = function() {
      return 'bar';
    };
    return FooLib;
  })();
  exports.FooLib = FooLib;
}).call(this);
