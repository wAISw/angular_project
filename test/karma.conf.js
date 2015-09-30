module.exports = function(config){
    config.set({

        basePath : '../',

        files : [
            "bower_components/angular/angular.min.js",
            "bower_components/jquery/dist/jquery.min.js",
            "bower_components/bootstrap/dist/js/bootstrap.min.js",
            "bower_components/angular-ui-router/release/angular-ui-router.min.js",
            "bower_components/angular-animate/angular-animate.min.js",
            'app/prod/*/*.js',
            'test/unit/*.js'
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};