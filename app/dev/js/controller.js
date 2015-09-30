;(function () {
    "use strict";

    angular
        .module('trackerApp', [
            'ui.router',
            'trackerApp.personal'
        ])
        .config(config)
        .controller('UsersCtrl', UsersCtrl)
        .filter("formatCurrency", formatCurrency);

    /* Controllers */

// @ngInject
    function config($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('About', {
                url: '/about',
                templateUrl: 'partials/partial-about.html'
            })
            .state('Users', {
                url: '/users',
                templateUrl: 'partials/partial-users.html'
            })
            .state('Home', {
                url: '/',
                templateUrl: 'partials/partial-home.html'
            })
            .state('Contact', {
                url: '/contact',
                templateUrl: 'partials/partial-contacts.html'
            });
        //$locationProvider.html5Mode(true);
    }

// @ngInject
    function UsersCtrl($scope, $http) {
        var s = this;
        s.title = "Заголовок";
        $http.get('db/users.json').success(function (data) {
            s.users = data;
        });
    }

// @ngInject
    function formatCurrency () {
        return function (val) {
            return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(val);
        }
    }

})();