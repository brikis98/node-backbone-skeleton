window.templates || (window.templates = {});
window.templates.index = function(obj) {
var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<html>\n  <head>\n    \n  </head>\n  <body>\n    Hello World\n  </body>\n</html>');}return __p.join('');
};