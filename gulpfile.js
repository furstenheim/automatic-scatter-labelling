const gulp = require('gulp')
const mocha = require('gulp-spawn-mocha')
const webpack = require('gulp-webpack')
const browserSync = require('browser-sync').create()

gulp.task('start-server', function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
})

gulp.task('webpack', function () {
  return gulp.src('index.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist/'))
})
gulp.task('server-reload', function () {
  browserSync.reload()
})

gulp.task('test', function () {
  gulp
    .src('test/*-test.js')
    .pipe(mocha().on('error', console.error))
})
gulp.task('watch', function () {
    gulp.watch(['index.html', 'src/*.*', 'index.js'], [/*'webpack', 'server-reload', */'test'])
    gulp.watch(['test/*.*'], ['test'])
})
gulp.task('default', [/*'start-server',*/'test', 'watch'])