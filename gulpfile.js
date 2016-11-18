var gulp = require('gulp')
var mocha = require('gulp-spawn-mocha')
var browserSync = require('browser-sync').create()

gulp.task('start-server', function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
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
    gulp.watch(['index.html', 'src/*.*', 'index.js'], ['server-reload', 'test'])
    gulp.watch(['test/*.*'], ['test'])
})
gulp.task('default', [/*'start-server',*/'test', 'watch'])