var fs = require('fs');
var path = require('path');
var watchTree = require('watch-tree');

exports.watch = function(templatesObject, _, templateDir, outputDir, templateExtension, doWrite) {
	// Compile all templates at start-up
	var templates = fs.readdirSync(templateDir);
	_.each(templates, function(template) { compileTemplate(path.join(templateDir, template)); });

	// Watch the templates directory and recompile them if a file changes or is created
	var watcher = watchTree.watchTree(templateDir, {'sample-rate': 500});
	watcher.on('fileModified', function(path) { compileTemplate(path); });
	watcher.on('fileCreated', function(path) { compileTemplate(path); });

	function compileTemplate(file) {
		if (file && path.extname(file) == templateExtension) {
			console.log('Recompiling: ' + file);
			var templateName = path.basename(file, templateExtension);
			var compiled = _.template(fs.readFileSync(file, 'UTF-8'));
			templatesObject[templateName] = compiled;
			if (doWrite) {
			  var asString = compiled.toString().replace('function anonymous', 'window.templates || (window.templates = {});\nwindow.templates.' + templateName + ' = function') + ';';			  
			  fs.writeFileSync(path.join(outputDir, templateName + '.js'), asString);  
			}			
		}
	}
}