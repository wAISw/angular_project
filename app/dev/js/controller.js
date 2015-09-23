"use strict";

var trackerApp = angular.module('trackerApp', ['ui.router']);
trackerApp.config(function($stateProvider, $urlRouterProvider) {
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
});