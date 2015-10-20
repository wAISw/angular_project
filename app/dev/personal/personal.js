;(function () {
    "use strict";

    angular
        .module('fitApp.personal', [
            'ui.router',
            'fitApp.fire',
            'fitApp.navbar',
            'fitApp.auth',
            'fitApp.personal.directive'
        ])
        .config(PersonalConfig)
        .controller('PersonalIndexCtrl', PersonalIndexCtrl)
        .factory('UserRepository', UserRepositoryFactory)
        .factory('UserProfile', UserProfileFactory)
        .factory('Exercises', ExercisesFactory)
        .controller('PersonalComplexCtrl', PersonalComplexCtrl)
        .controller('PersonalSettingsCtrl', PersonalSettingsCtrl)
        .controller('PersonalStatisticsCtrl', PersonalStatisticsCtrl)
        .controller('PersonalWorkoutCtrl', PersonalWorkoutCtrl)
        .controller('ExercisesCtrl', ExercisesCtrl);

    // @ngInject
    function ExercisesFactory(dbc, $firebaseArray) {
        var o = {};
        o.getAllExercises = function () {
            var ref = dbc.getRef();
            return $firebaseArray(ref.child('exercises'));
        };
        return o
    }

    // @ngInject
    function ExercisesCtrl(Exercises) {
        var s = this;
        s.exercisesList = Exercises.getAllExercises();

    }


    // @ngInject
    function PersonalConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('Complex', {
                url: '/personal/complex',
                templateUrl: 'personal/partial-complex.html',
                controller: 'PersonalComplexCtrl',
                controllerAs: 'pcc'
            })
            .state('Personal', {
                resolve: {
                    auth: /*@ngInclude*/ function (Authentication) {
                        return Authentication.requireAuth();
                    }
                },
                url: '/personal/:id',
                templateUrl: 'personal/partial-index.html',
                controller: 'PersonalIndexCtrl',
                controllerAs: 'pic'
            })
            .state('Exercises', {
                url: '/exercises',
                templateUrl: 'personal/partial-exercises.html',
                controller: 'ExercisesCtrl',
                controllerAs: 'ec'
            })
            .state('Settings', {
                url: '/personal/settings',
                templateUrl: 'personal/partial-settings.html',
                controller: 'PersonalSettingsCtrl',
                controllerAs: 'psc'
            })
            .state('Statistics', {
                url: '/personal/statistics',
                templateUrl: 'personal/partial-statistics.html',
                controller: 'PersonalStatisticsCtrl',
                controllerAs: 'pstatc'
            })
            .state('Workout', {
                url: '/personal/workout',
                templateUrl: 'personal/partial-workout.html',
                controller: 'PersonalWorkoutCtrl',
                controllerAs: 'pwc'
            });
    }

    // @ngInject
    function UserProfileFactory(dbc, $firebaseObject) {
        var o = {};
        var ref = dbc.getRef();
        var usersRef = ref.child('users');
        o.getUser = function (_id) {
            return $firebaseObject(usersRef.child(_id)).$loaded();
        };

        return o;
    }

    // @ngInject
    function UserRepositoryFactory(dbc, $firebaseArray) {
        var o = {};
        o.getAllUsers = function () {
            var ref = dbc.getRef();
            return $firebaseArray(ref.child('users'));
        };
        o.addNewUser = function (_user) {
            if (_user && _user.name && _user.name.length > 0) {
                var ref = dbc.getRef();
                var userList = $firebaseArray(ref.child('users'));
                return userList.$add(_user);
            }
            return false;
        };
        return o;
    }

    // @ngInject
    function PersonalIndexCtrl(UserProfile, $rootScope, $state, UserRepository, $stateParams) {
        var s = this;

        s.id = $stateParams.id;


        UserProfile.getUser(s.id).then(function (_user) {
            s.title = _user.fullName + ", персональная страница";
            s.user = _user;
        }).catch(function (error) {
            s.title = "Персональная страница.";
            switch (error.code) {
                case "PERMISSION_DENIED":
                    $rootScope.addAlert("danger", "Доступ запрещен");
                    break;
            }
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
