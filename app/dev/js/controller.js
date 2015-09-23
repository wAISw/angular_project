"use strict";

var trackerApp = angular.module('trackerApp', ['ui.router']);
trackerApp.config(["$stateProvider", "$urlRouterProvider","$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('About', {
            url: '/about',
            templateUrl: 'partials/partial-about.html'
        })
        .state('Home', {
            url: '/',
            templateUrl: 'partials/partial-home.html'
        })
        .state('Contact', {
            url: '/contact',
            templateUrl: 'partials/partial-contacts.html'
        });
    $locationProvider.html5Mode(true);
}]);