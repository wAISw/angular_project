;(function () {
    "use strict";

    angular
        .module('trackerApp', ['ui.router'])
        .config(config)
        .controller('UsersCtrl', UsersCtrl);

    /* Controllers */

// @ngInject
    config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
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
    config.$inject = ['$scope', '$http'];
    function UsersCtrl($scope, $http) {
        //$http.get('db/users.json').success(function(data, status, headers, config){
        //    console.log('data:',data,'\n\n status:',status,'\n\n headers:',headers,'\n\n config:',config);
        //    $scope.users = data;
        //});

        $scope.users = {q1: 1, q2: 2};
        //$scope.doneAndFilter = function (phoneItem) {
        //    return phoneItem.name && phoneItem.priority > 1 && phoneItem.status == true;
        //};
        //
        //$scope.sortField = undefined;
        //$scope.reverse = false;
        //
        //$scope.sort = function (fieldName) {
        //    if ($scope.sortField === fieldName) {
        //        $scope.reverse = !$scope.reverse;
        //    } else {
        //        $scope.sortField = fieldName;
        //        $scope.reverse = false;
        //    }
        //};
        //
        //$scope.isSortUp = function (fieldName) {
        //    return $scope.sortField === fieldName && !$scope.reverse
        //};
        //$scope.isSortDown = function (fieldName) {
        //    return $scope.sortField === fieldName && $scope.reverse
        //};
    }
}());