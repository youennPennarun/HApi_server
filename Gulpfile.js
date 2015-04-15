/*global require*/
var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    minifyCSS = require('gulp-minify-css');

// `gulp.task()` defines task that can be run calling `gulp xyz` from the command line
// The `default` task gets called when no task name is provided to Gulp
var paths = {
    main    : './app.js',
    sources : [ '**/*.js', '!node_modules/**', '!client/vendor/**', '!build/**'],
    client  : {
        jade    : 'app/**/*.jade'
    },
    css: ['./public/assets/css/*.css'],
    scripts: ['./public/controllers/*.js', './public/directives/*.js', './public/models/*.js', './public/models/music/*.js']
};
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['scripts']);
});
gulp.task('scripts', function () {
    gulp.src(paths.scripts)
    .pipe(concat('hapi.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('./dist/'))
    gulp.src(paths.css)
    .pipe(concat('hapi.min.js'))
    .pipe(minifyCSS({keepBreaks:false}))
    .pipe(gulp.dest('./dist/'))
});
gulp.task('minify-css', function() {
    gulp.src('./public/assets/css/*.css')
    .pipe(minifyCSS({keepBreaks:false}))
    .pipe(gulp.dest('./dist/'))
});
gulp.task('start',function(){
    nodemon({ script: './app.js', ignore: ['*']});
});
// livereload browser on client app changes
gulp.task('default', ['scripts', 'watch', 'start'], function(){
});