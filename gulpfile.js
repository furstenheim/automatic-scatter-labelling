var gulp = require('gulp')
var browserSync = require('browser-sync').create()

var URL = 'localhost:8000'
gulp.task('serve', function () {
  browserSync.init({
    proxy: `${URL}/automatic-scatter-chart-labelling/index.html`
  })
  gulp.watch('index.html').on('change', browserSync.reload)
})

gulp.task('default', ['serve'])