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
        root: 'app/prod',
        livereload: true
    });
});

// watch
gulp.task('watch', function(){
    gulp.watch('app/dev/css', ['css']);
    gulp.watch('app/dev/js', ['js']);
    gulp.watch('app/dev/index.html', ['html']);
    gulp.watch('app/dev/index.html', ['inject']);
});

// css
gulp.task('css', function () {
    gulp.src([
            "bower_components/bootstrap/dist/css/bootstrap.min.css"
        ])
        .pipe(concatCss('lib.min.css'))
        .pipe(gulp.dest('app/prod/css'));
    gulp.src([
            "app/dev/css/style.css"
        ])
        .pipe(concatCss('style.min.css'))
        .pipe(prefix({
            browsers: ['last 40 versions']
        }))
        .pipe(minifyCss(''))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('app/prod/css'))
        .pipe(connect.reload());
});

//js
gulp.task('js', function(){
    gulp.src([
        "bower_components/angular/angular.min.js",
        "bower_components/jquery/dist/jquery.min.js",
        "bower_components/bootstrap/dist/js/bootstrap.min.js",
        "bower_components/angular-ui-router/release/angular-ui-router.min.js"
        ])
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest('app/prod/js'));

    gulp.src([
        "app/dev/js/*.js"
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/prod/js'))
        .pipe(connect.reload());

});

// inject
gulp.task('inject', ['html'], function(){

    var target =  gulp.src('app/dev/index.html');

    // js
    var libs_js = gulp.src(['app/prod/js/*.js', '!app/prod/js/main.min.js'], {read: false});
    var main_js = gulp.src(['app/prod/js/main.min.js'], {read: false});
    // css
    var libs_css = gulp.src(['app/prod/css/*.css', '!app/prod/css/style.min.css'], {read: false});
    var style_css = gulp.src(['app/prod/css/style.min.css'], {read: false});

    return target.pipe(inject(libs_js, {relative:true, name:"libs_js"}))
        .pipe(inject(main_js, {relative:true, name:"main_js"}))
        .pipe(inject(libs_css, {relative:true, name:"libs_css"}))
        .pipe(inject(style_css, {relative:true, name:"style_css"}))
        .pipe(gulp.dest('app/prod/'))
        .pipe(connect.reload());

});

// html
gulp.task('html',['js'], function(){
    gulp.src('app/dev/**/*.html')
        .pipe(gulp.dest('app/prod/'))
        .pipe(connect.reload());
});

// default
gulp.task('default', ['connect', 'css', 'js', 'html', 'inject', 'watch']);
