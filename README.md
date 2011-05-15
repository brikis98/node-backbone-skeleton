# Overview

This is project represents the skeleton of an application with node.js server-side and backbone.js client-side. It is primarily for my own personal use as I develop projects using these technologies, but may be handy for others too. I will gradually evolve and improve this structure as I become more familiar with these JavaScript tools.

# Technologies

* Server: node.js + express
* Client-side MVC: backbone.js
* Templating: underscore.js
* Preprocessor: coffee-script
* Client-side library: jQuery
* Stylesheets: Compass and SASS

# Directory structure

* /bootstrap: client-side JS files used to bootstrap the application, e.g. create the backbone controllers, models and views.
* /compiled: all files compiled to JavaScript - namely, all the coffee-script and templating code - is dumped in this directory.
* /config: configuration settings for the project. 
* /controllers: backbone.js controllers.
* /lib: 3rd party libraries, including jQuery, underscore.js and backbone.js.
* /models: backbone.js models.
* /node_modules: node.js modules installed via npm, including express, watch-tree, and underscore.js.
* /public: all static content (CSS, JS, images) publicly visible to the browser gets dumped here. 
* server.coffee: the main node.js server file. Gets automatically compiled into server.js using /util/watch.rb.
* /stylesheets: SCSS stylesheets go here and are compiled when you hit save via compass into /public/css.
* /templates: underscore templates go here and are compiled when you hit save into /compiled.
* /util: utility classes, described below.
* /views: backbone.js views.

# Utility classes

### watch.rb 

Ruby class that uses FSSM to watch the directories above and when a change is detected:

* Compiles coffee-script files into .js files, putting client side ones under /compiled.
* Uses jammit to concatenate and compress all .js files under /compiled into a single file under /public/js/assets.js

Run this class while coding by executing `ruby util/watch.rb`.

### watch.js

JavaScript class that uses watch-tree to watch the /templates directory and when a change is detected in a file *foo*:

* Compiles the template into an efficient JavaScript function
* Adds this function to the templates object of server.js so it can be used server-side by calling `templates['*foo*']`
* Writes this function into /compiled/*foo*.js so that it can be included client-side and rendered by calling `window.templates['*foo*'] 

This class runs automatically whenever server.js is running.

### Compass

You must install compass separately so that it can compile your SASS code every time you hit save. Run it using the commaind `compass watch -c config/config.rb`. 
