;(function () {
    "use strict";

    angular
        .module('trackerApp.personal', [
            'ui.router',
            'trackerApp.fire'
        ])
        .config(PersonalConfig)
        .controller('PersonalIndexCtrl', PersonalIndexCtrl)
        .factory('UserRepository', UserRepositoryFactory)
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
    function UserRepositoryFactory(dbc, $firebaseArray) {
        var o = {};
        o.getAllUsers = function(){
            var ref = dbc.getRef();
            return $firebaseArray(ref.child('users'));
        };
        o.addNewUser = function (_user) {
            if(_user && _user.name && _user.name.length>0){
                var ref = dbc.getRef();
                var userList = $firebaseArray(ref.child('users'));
                return userList.$add(_user);
            }
            return false;
        };
        return o;
    }

    // @ngInject
    function PersonalIndexCtrl(UserRepository) {
        var s = this;
        s.title = "Личный кабинет";
        var users = UserRepository.getAllUsers();
        users.$loaded(function (_usersList) {
            s.users = _usersList;
        });

        users.$watch(function (_usersList) {
            users.$loaded().then(function (_usersList) {
                s.users = _usersList;
            });
        });


    }

    // @ngInject
    function PersonalComplexCtrl() {
        var s = this;
        s.title = "Мои комплексы";
    }

    // @ngInject
    function PersonalSettingsCtrl() {
        var s = this;
        s.title = "Мои настройки";
    }

    // @ngInject
    function PersonalStatisticsCtrl() {
        var s = this;
        s.title = "Моя статистика";
    }

    // @ngInject
    function PersonalWorkoutCtrl() {
        var s = this;
        s.title = "Тренировка";
    }
})();

//var UserRepository = function (dbc) {
//    // private
//    var repository;
//
//    function createRepository() {
//        repository = {
//            count: 2
//        };
//        return repository;
//    }
//
//    return {
//        getInstance: function () {
//            if (!repository) {
//                console.log("create");
//                repository = createRepository();
//            }
//            return repository;
//        }
//    };
//};
//
//var repository = new UserRepository();
//var rep1 = repository.getInstance();
//var rep2 = repository.getInstance();
//console.log(rep1.count, rep2.count);
//
//rep1.count = 1;
//console.log(rep1.count, rep2.count);
//
//rep2.count = 3;
//console.log(rep1.count, rep2.count);
