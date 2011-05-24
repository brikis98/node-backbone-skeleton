(function() {
  exports.common = {
    publicDir: 'public',
    templatesDir: 'templates',
    templatesExtension: '.html'
  };
  exports.development = {
    templatesOut: 'compiled/templates',
    watcherOptions: {
      compass: 'config/config.rb',
      verbose: true,
      package: 'config/jammit.yml',
      packageOut: 'public/js',
      paths: {
        'server\\.coffee': {
          type: 'coffee',
          out: '.'
        },
        'util/.+\\.coffee': {
          type: 'coffee',
          out: 'util'
        },
        'config/.+\\.coffee': {
          type: 'coffee',
          out: 'config'
        },
        'bootstrap/.+\\.coffee': {
          type: 'coffee',
          out: 'compiled/bootstrap',
          package: true
        },
        'models/.+\\.coffee': {
          type: 'coffee',
          out: 'compiled/models',
          package: true
        },
        'controllers/.+\\.coffee': {
          type: 'coffee',
          out: 'compiled/controllers',
          package: true
        },
        'views/.+\\.coffee': {
          type: 'coffee',
          out: 'compiled/views',
          package: true
        },
        'lib/.+\\.coffee': {
          type: 'coffee',
          out: 'compiled/lib',
          package: true
        },
        'templates/.+\\.html': {
          type: 'template',
          out: 'compiled/templates',
          package: true
        }
      }
    }
  };
  exports.production = {};
  exports.test = {};
}).call(this);
