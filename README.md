# Overview

This is project represents the skeleton of an application with [node.js](http://nodejs.org/) server-side and [backbone.js](http://documentcloud.github.com/backbone/) client-side. All JavaScript is written using [CoffeeScript](http://jashkenas.github.com/coffee-script), all CSS is written using [Compass](http://compass-style.org/) and [SASS](http://sass-lang.com/), all templates are written using [underscore.js](http://documentcloud.github.com/underscore/) and all client-side JavaScript is packaged using [Jammit](http://documentcloud.github.com/jammit/). A utility class is provided that automatically recompiles & packages all of these pre-processor languages every time you hit save, so you can iterate quickly: make a code change, hit refresh. It is primarily for my own personal use as I develop projects using these technologies, but may be handy for others too. I will gradually evolve and improve this structure as I become more familiar with these JavaScript tools.

# Technologies

* Server: [node.js](http://nodejs.org/) + [express](http://expressjs.com/)
* Client-side MVC: [backbone.js](http://documentcloud.github.com/backbone/)
* Templating: [underscore.js](http://documentcloud.github.com/underscore/)
* Preprocessor: [CoffeeScript](http://jashkenas.github.com/coffee-script)
* Client-side library: [jQuery](http://jquery.com/)
* Stylesheets: [Compass](http://compass-style.org/) and [SASS](http://sass-lang.com/)
* Config: [node-settings](https://github.com/mgutz/node-settings)

# Directory structure

* /bootstrap: client-side JS files used to bootstrap the application, e.g. setup the namespace as well as create the [backbone.js](http://documentcloud.github.com/backbone/) controllers, models and views.
* /compiled: all files compiled to JavaScript - namely, all the [CoffeeScript](http://jashkenas.github.com/coffee-script) and templating code - is dumped in this directory. You should never need to change anything in here by hand.
* /config: configuration settings for the project. 
* /controllers: [backbone.js](http://documentcloud.github.com/backbone/) controllers.
* /lib: 3rd party libraries, including [jQuery](http://jquery.com/), [underscore.js](http://documentcloud.github.com/underscore/) and [backbone.js](http://documentcloud.github.com/backbone/).
* /models: [backbone.js](http://documentcloud.github.com/backbone/) models.
* /node_modules: [node.js](http://nodejs.org/) modules installed via npm, including [express](http://expressjs.com/), [watch-tree](https://github.com/tafa/node-watch-tree), [node-utils](https://github.com/mikeal/node-utils) and [underscore.js](http://documentcloud.github.com/underscore/).
* /public: all static content (CSS, JS, images) publicly visible to the browser gets dumped here. 
* server.coffee: the main [node.js](http://nodejs.org/) server file. Gets automatically compiled into server.js using /util/watcher.coffee.
* /stylesheets: [SASS](http://sass-lang.com/) stylesheets go here and are compiled when you hit save via [Compass](http://compass-style.org/) into /public/css.
* /templates: [underscore.js](http://documentcloud.github.com/underscore/) templates go here and are compiled when you hit save into /compiled/templates.
* /util: utility class that auto-recompiles and packages all the JavaScript and CSS.
* /views: [backbone.js](http://documentcloud.github.com/backbone/) views.

# /util/watcher.coffee

This class is loaded by `server.js` at startup to watch the project using [watch-tree](https://github.com/tafa/node-watch-tree) and recompile and package files as necessary so that you can iterate quickly. The goal is to support "make a change, hit reload" style development even though this project uses a number of pre-processors that require "compilation". It works reasonably well already and as I improve, I'll likely break this off into its own Github/NPM project.

Sample usage:

```javascript
var Watcher = require('./util/watcher').watcher;
var options = {
  compass: 'config/config.rb',
  verbose: true,
  templates: templates,
  package: 'config/jammit.yml',
  packageOut: 'public/js',
  paths: {
    'server.coffee':                    {type: 'coffee', out: '.'},
    'templates/**/*.html':              {type: 'template', out: 'compiled/templates', package: true},
    'views/**/*.coffee':                {type: 'coffee', out: 'compiled/views', package: true}     
  }
};
var watcher = new Watcher(options);
watcher.watch();
```

Executing the `watch()` function does the following:

* Runs `compass watch` if a config file is specified in `options.compass`
* Watches over the root directory (as specified in `options.root` or `'.'` by default) and takes action any time a file changes that matches one of the keys (globs processed using [node-glob](https://github.com/isaacs/node-glob)). The action taken depends on the `type`:
  * coffee: compiles the file using [CoffeeScript](http://jashkenas.github.com/coffee-script) and puts the output into the directory specified by `out`  
  * template: compiles the template using [underscore.js](http://documentcloud.github.com/underscore/) and puts the output into the directory specified by `out`. Also adds this template by filename into the object specified in `options.templates`: e.g. if `foo.html` changed, `foo.js` would be created and `options.templates['foo']` would be set to the compiled function.
  * If `package: true` is specified, will also run [Jammit](http://documentcloud.github.com/jammit/) using the config file specified in `options.package` and put the output in the folder specified in `options.packageOut`