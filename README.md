# Overview

This is project represents the skeleton of an application with [node.js](http://nodejs.org/) server-side and [backbone.js](http://documentcloud.github.com/backbone/) client-side. It is primarily for my own personal use as I develop projects using these technologies, but may be handy for others too. I will gradually evolve and improve this structure as I become more familiar with these JavaScript tools.

# Technologies

* Server: [node.js](http://nodejs.org/) + [express](http://expressjs.com/)
* Client-side MVC: [backbone.js](http://documentcloud.github.com/backbone/)
* Templating: [underscore.js](http://documentcloud.github.com/underscore/)
* Preprocessor: [CoffeeScript](http://jashkenas.github.com/coffee-script)
* Client-side library: [jQuery](http://jquery.com/)
* Stylesheets: [Compass](http://compass-style.org/) and [SASS](http://sass-lang.com/)

# Directory structure

* /bootstrap: client-side JS files used to bootstrap the application, e.g. create the [backbone.js](http://documentcloud.github.com/backbone/) controllers, models and views.
* /compiled: all files compiled to JavaScript - namely, all the [CoffeeScript](http://jashkenas.github.com/coffee-script) and templating code - is dumped in this directory.
* /config: configuration settings for the project. 
* /controllers: [backbone.js](http://documentcloud.github.com/backbone/) controllers.
* /lib: 3rd party libraries, including [jQuery](http://jquery.com/), [underscore.js](http://documentcloud.github.com/underscore/) and [backbone.js](http://documentcloud.github.com/backbone/).
* /models: [backbone.js](http://documentcloud.github.com/backbone/) models.
* /node_modules: [node.js](http://nodejs.org/) modules installed via npm, including [express](http://expressjs.com/), [watch-tree](https://github.com/tafa/node-watch-tree), and [underscore.js](http://documentcloud.github.com/underscore/).
* /public: all static content (CSS, JS, images) publicly visible to the browser gets dumped here. 
* server.coffee: the main [node.js](http://nodejs.org/) server file. Gets automatically compiled into server.js using /util/watch.rb.
* /stylesheets: [SASS](http://sass-lang.com/) stylesheets go here and are compiled when you hit save via [Compass](http://compass-style.org/) into /public/css.
* /templates: [underscore.js](http://documentcloud.github.com/underscore/) templates go here and are compiled when you hit save into /compiled.
* /util: utility classes, described below.
* /views: [backbone.js](http://documentcloud.github.com/backbone/) views.

# Utility classes

### watch.rb 

Ruby class that uses [FSSM](https://github.com/ttilley/fssm) to watch the directories above and when a change is detected:

* Compiles [CoffeeScript](http://jashkenas.github.com/coffee-script) files into .js files, putting client side ones under /compiled.
* Uses [Jammit](http://documentcloud.github.com/jammit/) to concatenate and compress all .js files under /compiled into a single file under /public/js/assets.js

Run this class while coding by executing `ruby util/watch.rb`.

### watch.js

JavaScript class that uses [watch-tree](https://github.com/tafa/node-watch-tree) to watch the /templates directory and when a change is detected in a file *foo*:

* Compiles the template into an efficient JavaScript function
* Adds this function to the templates object of server.js so it can be used server-side by calling `templates['*foo*']`
* Writes this function into /compiled/*foo*.js so that it can be included client-side and rendered by calling `window.templates['*foo*']. This step is only done during development, not during production.

This class runs automatically whenever server.js is running. 

### Compass

You must install [Compass](http://compass-style.org/) separately so that it can compile your [SASS](http://sass-lang.com/) code every time you hit save. Run it using the command `compass watch -c config/config.rb`. 
