;(function () {
    "use strict";

    angular
        .module('trackerApp', [
            'ui.router',
            'trackerApp.personal',
            'ngAnimate'
        ])
        .constant('FIRE_BASE', 'http')
        .value('configOptions', {
            lang: 'ru',
            timezone: '+3'
        })
        .config(config)
        .run(Run)
        .controller('UsersCtrl', UsersCtrl)
        .factory('UsersFactory', UsersFactory)
        .service('UsersService', UsersService)
        .provider('Users', UsersProvider)
        .filter("formatCurrency", formatCurrency);

    /* Controllers */

// @ngInject
    function config($stateProvider, $urlRouterProvider, $locationProvider, UsersProvider, $provide) {
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
        console.log(UsersProvider);
        UsersProvider.setPrivate('Not Almost Private');
        console.log(UsersProvider);

        $provide.decorator('UsersFactory', ['$delegate', function ($delegate) {
            $delegate.helloPrivate = function () {
                return "hello " + $delegate.getPrivate();
            };
            return $delegate;
        }]);
        //$locationProvider.html5Mode(true);
    }

// @ngInject
    function UsersService() {
        var privateVal = null;

        this.val = "some value";

        this.getPrivate = function () {
            return privateVal;
        };

        this.setPrivate = function (_val) {
            privateVal = _val;
        };
    }

// @ngInject
    function UsersProvider(){
        var privateVal = "private";
        return {
            setPrivate: function (_privateVal) {
                privateVal = _privateVal;
            },
            $get: function () {
                var o = {};
                o.getPrivate = function () {
                    return privateVal;
                };

                return o;
            }
        };
    }
// @ngInject
    function UsersFactory() {
        var o = {};

        var privateVal = null;

        o.val = "some value";

        o.getPrivate = function () {
            return privateVal;
        };

        o.setPrivate = function (_val) {
            privateVal = _val;
        };

        return o;
    }

// @ngInject
    function Run(configOptions, UsersFactory, UsersService) {
        console.log(configOptions);
        UsersFactory.setPrivate('hello');
        console.log(UsersService.getPrivate());
        UsersService.setPrivate("opa")
    }

// @ngInject
    function UsersCtrl($scope, $http, UsersFactory, UsersService, Users) {
        var s = this;
        s.title = "Пользователи";
        s.hello = UsersFactory.helloPrivate();
        console.log(UsersService.getPrivate());
        console.log(Users.getPrivate());
        $http.get('db/users.json').success(function (data) {
            s.users = data;
        });
    }

// @ngInject
    function formatCurrency() {
        return function (val) {
            return new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(val);
        }
    }

})();