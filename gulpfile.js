"use strict";
var gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    prefix = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    minify = require('gulp-min'),
    uglify = require('gulp-uglify'),
    series = require('stream-series'),
    livereload = require('gulp-livereload'),
    inject = require('gulp-inject'),
    notify = require('gulp-notify');

// connect
gulp.task('connect', function() {
    connect.server({
        root: 'app',
        livereload: true
    });
});

// watch
gulp.task('watch', function(){
    gulp.watch('app/dev/css', ['css']);
    gulp.watch('app/dev/js', ['js']);
    gulp.watch('app/dev/index.html', ['html']);
});

// css
gulp.task('css', function () {
    gulp.src([
            "bower_components/bootstrap/dist/css/bootstrap.min.css",
        ])
        .pipe(concatCss())
        .pipe(rename('lib.min.css'))
        .pipe(gulp.dest('app/prod/css'));
    gulp.src([
            "app/dev/css/style.css",
        ])
        .pipe(concatCss())
        .pipe(prefix({
            browsers: ['last 40 versions']
        }))
        .pipe(minifyCss(''))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('app/prod/css'))
        .pipe(notify('css done!'));
});

//js
gulp.task('js', function(){
    gulp.src([
        "bower_components/bootstrap/dist/js/bootstrap.min.js",
        "bower_components/jquery/dist/jquery.min.js",
        "bower_components/angular/angular.min.js",
        "bower_components/angular-ui-router/release/angular-ui-router.min.js",
        ])
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest('app/prod/js'));

    gulp.src([
        "app/dev/js/*.js"
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/prod/js'));

});

// inject
gulp.task('inject', ['html', 'js'], function(){

    var libs = gulp.src(['app/prod/js/*.js', '!app/prod/js/main.min.js'], {read: false});
    var main = gulp.src(['app/prod/js/main.min.js'], {read: false});
    gulp.src('app/prod/index.html')
        .pipe(inject(series(libs, main),{relative:true}))
        .pipe(gulp.dest('app/prod'))
        .pipe(notify("inject done!"));
});

// html
gulp.task('html', function(){
    gulp.src('app/dev/**/*.html')
        .pipe(gulp.dest('app/prod/'));
    //.pipe(connect.reload());
});

// default
gulp.task('default', ['html', 'js', 'inject']);
