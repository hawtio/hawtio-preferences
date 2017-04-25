var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    eventStream = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    del = require('del'),
    fs = require('fs'),
    path = require('path'),
    uri = require('urijs'),
    s = require('underscore.string'),
    argv = require('yargs').argv,
    logger = require('js-logger'),
    hawtio = require('hawtio-node-backend');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  logLevel: argv.debug ? logger.DEBUG : logger.INFO,
  main: '.',
  ts: ['plugins/**/*.ts'],
  templates: ['plugins/**/*.html'],
  templateModule: pkg.name + '-templates',
  dist: argv.out || './dist/',
  js: pkg.name + '.js',
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    outFile: 'compiled.js',
    declaration: true,
    noResolve: false
  }),
  sourceMap: argv.sourcemap
};

gulp.task('bower', function() {
  return gulp.src('index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

/** Adjust the reference path of any typescript-built plugin this project depends on */
gulp.task('path-adjust', function() {
return eventStream.merge(
    gulp.src('libs/**/includes.d.ts')
      .pipe(plugins.replace(/"\.\.\/libs/gm, '"../../../libs'))
      .pipe(gulp.dest('libs')),
    gulp.src('libs/**/defs.d.ts')
      .pipe(plugins.replace(/"libs/gm, '"../../libs'))
      .pipe(gulp.dest('libs'))
  );
});

gulp.task('clean-defs', function() {
  return del('defs.d.ts');
});

gulp.task('_tsc', ['clean-defs'], function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.init()))
    .pipe(config.tsProject())
    .on('error', plugins.notify.onError({
      message: '#{ error.message }',
      title: 'Typescript compilation error'}));

  return eventStream.merge(
    tsResult.js
      .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.write()))
      .pipe(gulp.dest('.')),
    tsResult.dts
      .pipe(plugins.rename('defs.d.ts'))
      .pipe(gulp.dest('.')));
});

gulp.task('tsc', ['path-adjust'], function() { gulp.start('_tsc'); });

gulp.task('_template', ['_tsc'], function() {
  return gulp.src(config.templates)
    .pipe(plugins.angularTemplatecache({
      filename: 'templates.js',
      root: 'plugins/',
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});
gulp.task('template', ['tsc'], function() { gulp.start('_template'); });

gulp.task('_concat', ['_template'], function() {
  return gulp.src(['compiled.js', 'templates.js'])
    .pipe(plugins.concat(config.js))
    .pipe(gulp.dest(config.dist));
});
gulp.task('concat', ['template'], function() { gulp.start('_concat'); });

gulp.task('_clean', ['_concat'], function() {
  return del(['templates.js', 'compiled.js']);
});
gulp.task('clean', ['concat'], function() { gulp.start('_clean'); });

gulp.task('watch', ['build'], function() {
  plugins.watch(['libs/**/*.js', 'libs/**/*.css', 'index.html', 'dist/*.js'], function() {
    gulp.start('reload');
  });
  plugins.watch(['libs/**/*.d.ts', config.ts, config.templates], function() {
    gulp.start(['_tsc', '_template', '_concat', '_clean']);
  });
});

gulp.task('connect', ['watch'], function() {
  /*
   * Example of fetching a URL from the environment, in this case for kubernetes
  var kube = uri(process.env.KUBERNETES_MASTER || 'http://localhost:8080');
  console.log("Connecting to Kubernetes on: " + kube);
  */

  hawtio.setConfig({
    logLevel: config.logLevel,
    port: 2772,
    staticProxies: [
    /*
    // proxy to a service, in this case kubernetes
    {
      proto: kube.protocol(),
      port: kube.port(),
      hostname: kube.hostname(),
      path: '/services/kubernetes',
      targetPath: kube.path()
    },
    // proxy to a jolokia instance
    {
      proto: kube.protocol(),
      hostname: kube.hostname(),
      port: kube.port(),
      path: '/jolokia',
      targetPath: '/hawtio/jolokia'
    }
    */
    ],
    staticAssets: [{
      path: '/',
      dir: '.'

    }],
    fallback: 'index.html',
    liveReload: {
      enabled: true
    }
  });
  hawtio.use('/', function(req, res, next) {
          var path = req.originalUrl;
          // avoid returning these files, they should get pulled from js
          if (s.startsWith(path, '/plugins/') && s.endsWith(path, 'html')) {
            if (argv.debug) {
              console.log("returning 404 for: ", path);
            }
            res.statusCode = 404;
            res.end();
          } else {
            if (argv.debug) {
              console.log("allowing: ", path);
            }
            next();
          }
        });
  hawtio.listen(function(server) {
    var host = server.address().address;
    var port = server.address().port;
    console.log("started from gulp file at ", host, ":", port);
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(hawtio.reload());
});

gulp.task('build', ['bower', 'path-adjust', 'tsc', 'template', 'concat', 'clean']);

gulp.task('default', ['connect']);
