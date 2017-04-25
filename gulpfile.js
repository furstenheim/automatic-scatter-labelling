const gulp = require('gulp')
const mocha = require('gulp-spawn-mocha')
const browserify = require('browserify')
const babelify = require('babelify')
const exposify = require('exposify')
const watchify = require('watchify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserSync = require('browser-sync').create()
const transform = require('vinyl-transform')
const notify = require('gulp-notify')

gulp.task('start-server', ['watch'], function () {
  browserSync.init({
    server: {
      baseDir: './'
    },
    startPath: '/example'
  })
})

gulp.task('build:main', function () {
  var bundler = watchify(browserify({
    standalone: 'automaticScatterLabelling',
    entries: [
      './index.js'
    ],
    debug: true
  }))

  function gulpBundle () {
    bundler.bundle()
      .on('error', function (err) {
        return notify().write(err)
      })
      .pipe(source('automatic-labelling.js'))
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
      .transform('exposify', {expose: {lodash: '_'}})
      .transform(babelify, {plugins: ['meaningful-logs']})
      .on('update', function (a) {
        gulpBundle()
      })
      .on('error', function (e) {
        return notify().write(err)
      })
      .on('log', function (log) {
        console.log(log)
      })
    return gulpBundle()
})

gulp.task('test', function () {
  gulp
    .src('test/*-test.js')
    .pipe(mocha().on('error', console.error))
})
gulp.task('watch', ['build:main'], function () {
    //gulp.watch(['example/*.*', 'src/*.*', 'index.js']/*, ['server-reload']*/)
    //gulp.watch(['test/*.*'], ['test'])
})
gulp.task('default', [/*'start-server',*/'start-server'])
