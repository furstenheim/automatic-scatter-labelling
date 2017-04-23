const gulp = require('gulp')
const mocha = require('gulp-spawn-mocha')
const browserify = require('browserify')
const babelify = require('babelify')
const exposify = require('exposify')
const browserifyShim = require('browserify-shim')
const watchify = require('watchify')
const source = require('vinyl-source-stream')
const literalify = require('literalify')
const buffer = require('vinyl-buffer')
const browserSync = require('browser-sync').create()
var transform = require('vinyl-transform')
const through = require('through2')
gulp.task('start-server', ['watch'], function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
})

gulp.task('build:main', function () {
  var bundler = watchify(browserify({
    externals: ['lodash'],
    entries: [
      './index.js'
    ],
    debug: true,
    shim: {
      lodash: {
        exports: 'global:_'
      }
    }
  }))

  function transformer (file) {
    return through(function (buf, enc, next) {
      this.push(buf.toString('utf8').replace('require(\'lodash\')', 'global._'))
      next()
    })
  }
  function gulpBundle () {
    bundler.bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest('dist/'))
      .on('error', function (e) {
        console.error(e)
      })
      .on('end', function () {
        console.log('finished bundling')
        browserSync.reload()
      })
  }
    bundler
      .transform(babelify, {plugins: ['meaningful-logs']})
      .on('update', function (a) {
        console.log('update')
        gulpBundle()
      })
      .on('error', function (e) {
        console.error(e)
      })
      .on('log', function (log) {
        console.log(log)
      })
    return gulpBundle()
})/*
gulp.task('server-reload', function () {
  browserSync.reload()
})*/

gulp.task('test', function () {
  gulp
    .src('test/*-test.js')
    .pipe(mocha().on('error', console.error))
})
gulp.task('watch', ['build:main'], function () {
    gulp.watch(['example/*.*', 'src/*.*', 'index.js']/*, ['server-reload']*/)
    //gulp.watch(['test/*.*'], ['test'])
})
gulp.task('default', [/*'start-server',*/'start-server'])