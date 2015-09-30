;(function () {
    "use strict";

    angular
        .module('trackerApp.personal', ['ui.router'])
        .config(PersonalConfig)
        .controller('PersonalIndexCtrl', PersonalIndexCtrl)
        .controller('PersonalComplexCtrl', PersonalComplexCtrl)
        .controller('PersonalSettingsCtrl', PersonalSettingsCtrl)
        .controller('PersonalStatisticsCtrl', PersonalStatisticsCtrl)
        .controller('PersonalWorkoutCtrl', PersonalWorkoutCtrl);

    // @ngInject
    function PersonalConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('Personal', {
                url: '/personal',
                templateUrl: 'personal/partial-index.html',
                controller: 'PersonalIndexCtrl',
                controllerAs: '_pic_'
            })
             .state('Complex', {
                url: '/personal/complex',
                templateUrl: 'personal/partial-complex.html',
                controller: 'PersonalComplexCtrl',
                controllerAs: '_pcc_'
            })
             .state('Settings', {
                url: '/personal/settings',
                templateUrl: 'personal/partial-settings.html',
                controller: 'PersonalSettingsCtrl',
                controllerAs: '_psc_'
            })
             .state('Statistics', {
                url: '/personal/statistics',
                templateUrl: 'personal/partial-statistics.html',
                controller: 'PersonalStatisticsCtrl',
                controllerAs: '_pstatc_'
            })
              .state('Workout', {
                url: '/personal/workout',
                templateUrl: 'personal/partial-workout.html',
                controller: 'PersonalWorkoutCtrl',
                controllerAs: '_pwc_'
            });
    }

    // @ngInject
    function PersonalIndexCtrl (){
        var s = this;
        s.title = "Личный кабинет";
    }

    // @ngInject
    function PersonalComplexCtrl (){
        var s = this;
        s.title = "Мои комплексы";
    }

    // @ngInject
    function PersonalSettingsCtrl (){
        var s = this;
        s.title = "Мои настройки";
    }

    // @ngInject
    function PersonalStatisticsCtrl (){
        var s = this;
        s.title = "Моя статистика";
    }

    // @ngInject
    function PersonalWorkoutCtrl (){
        var s = this;
        s.title = "Тренировка";
    }



})();