'use strict';

var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

gulp.task('build', function () {
    browserify({
        entries: './app/js/main.js',
        debug: true
    })
    .transform(babelify)
    .bundle()
    .pipe(source('app.main.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy', function () {
    gulp.src('app/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    https: true
  });
});

gulp.task('watch', function () {
    gulp.watch('app/**/*.js', ['build']);
    gulp.watch('app/*.html', ['copy']);
    gulp.watch('app/**/*.scss', ['sass']);
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('dist/**/*.css', browserSync.reload);
    gulp.watch('dist/**/*.js', browserSync.reload);
    gulp.watch('dist/*.html', browserSync.reload);
});

gulp.task('default', ['browserSync', 'copy', 'sass', 'build', 'watch']);
