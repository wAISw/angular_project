;(function () {
    "use strict";

    angular
        .module('fitApp.personal', [
            'ui.router',
            'fitApp.fire',
            'fitApp.navbar',
            'fitApp.auth',
            'infinite-scroll',
            'fitApp.personal.directive'
        ])
        .config(PersonalConfig)
        .controller('PersonalIndexCtrl', PersonalIndexCtrl)
        .factory('UserRepository', UserRepositoryFactory)
        .factory('UserProfile', UserProfileFactory)
        .factory('Exercises', ExercisesFactory)
        .factory("Complex", ComplexFactory)
        .controller('PersonalComplexCtrl', PersonalComplexCtrl)
        .controller('PersonalSettingsCtrl', PersonalSettingsCtrl)
        .controller('PersonalStatisticsCtrl', PersonalStatisticsCtrl)
        .controller('PersonalWorkoutCtrl', PersonalWorkoutCtrl)
        .controller('ExercisesCtrl', ExercisesCtrl);

    // @ngInject
    function PersonalConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('Complex', {
                url: '/personal/complex',
                templateUrl: 'personal/partial-complex.html',
                controller: 'PersonalComplexCtrl',
                controllerAs: 'pcc'
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
            });
    }


    // @ngInject
    function ExercisesFactory(dbc, $firebaseArray) {
        var o = {};
        var ref = dbc.getRef();
        o.getAllExercises = function () {
            return $firebaseArray(ref.child('exercises'));
        };
        o.getPagedExercises = function (_st, _len) {
            return $firebaseArray(
                ref.child('exercises')
                    .orderByKey()
                    .startAt(_st)
                    .limitToFirst(_len)
            ).$loaded();
        };
        return o
    }

    // @ngInject
    function ExercisesCtrl(Exercises, Complex) {
        var s = this;
        s.exercisesList = [];
        s.usersComplex = Complex.getComplex();
        var last = 0;
        s.nextPage = function () {
            Exercises.getPagedExercises('' + last, 5).then(function (_data) {
                angular.forEach(_data, function (elem) {
                    s.exercisesList.push(elem);
                    last++;
                });
            });
        };
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
    function PersonalComplexCtrl(Complex, $rootScope) {
        var s = this;
        s.title = "Мои комплексы";
        s.clearAddComplexObj = function () {
            s.addComplexForm = {
                ComplexName: "",
                DescriptionComplex: "",
                ComplexActive: ""
            };
        };
        s.clearAddComplexObj();
        s.delete_quest = function (comId) {
            $("#remove-complex button.delete-button").data({'com-id': comId}).attr({"data-com-id": comId});
            $("#remove-complex-button").click();
        };
        s.addComplex = function () {
            Complex
                .addNewComplex(s.addComplexForm)
                .then(function (data) {
                    $rootScope.closeAlert();
                    $rootScope.addAlert("success", "Комплекс успешно добавлен.");
                }).catch(function (error) {
                $rootScope.closeAlert();
                switch (error.code) {
                    case "needAuth":
                        $rootScope.addAlert("danger", error.text);
                        break;
                }
            });
        };
        s.complexList = Complex.getComplex();
    }

    // @ngInject
    function ComplexFactory(dbc, $rootScope, $q, $firebaseArray, $firebaseObject, $state) {
        var o = {};
        var defered = $q.defer();
        var ref = dbc.getRef();
        var complexesRef = ref.child('complexes');
        var complexToExerc = ref.child('com2exerc');
        var exercList = ref.child('exercises');
        o.addNewComplex = function (newComplex) {
            if (!$rootScope.isAuth) {
                defered.reject({
                    text: "Пожалуйста авторизуйтесь!",
                    code: "needAuth"
                });
                return defered.promise;
            } else {
                var complexesList = $firebaseArray(complexesRef.child($rootScope.isAuth.uid));
                return complexesList.$add({
                    name: newComplex.ComplexName,
                    description: newComplex.DescriptionComplex,
                    active: newComplex.ComplexActive
                });
            }
        };
        o.getComplex = function () {
            if (!$rootScope.isAuth) {
                $state.go("Auth");
            } else {
                return $firebaseArray(complexesRef.child($rootScope.isAuth.uid));
            }
        };
        o.addToComplex = function (exercToCom) {
            if (exercToCom.exerc === false || exercToCom.com === false) {
                defered.reject({
                    res: false,
                    text: "Ошибка",
                    code: "invalidData"
                });
            } else {
                complexToExerc
                    .child($rootScope.isAuth.uid + "/" + exercToCom.com + "/" + exercToCom.exerc).set({
                    active: "Y"
                }, function () {
                    defered.resolve({
                        res: true
                    });
                });
            }
            return defered.promise;
        };
        o.getExercToComplex = function (comId) {
            return $firebaseObject(
                complexToExerc
                    .child($rootScope.isAuth.uid + "/" + comId)
            ).$loaded(function (data) {
                return $firebaseArray(exercList)
                    .$loaded(function (exercListArray) {
                        var exercs = [];
                        angular.forEach(data, function (el, k) {
                            exercs.push(exercListArray.$getRecord("" + k));
                        });
                        return exercs;
                    });
            });
        };
        o.activateComplex = function (comId, activeFlag) {
            if (comId !== "" && $rootScope.isAuth.uid) {
                var newFlag = activeFlag ? '' : true;
                complexesRef
                    .child($rootScope.isAuth.uid + "/" + comId + "/").update({
                    active: newFlag
                }, function () {
                    defered.resolve({
                        res: true
                    });
                });
            } else {
                defered.reject({
                    res: false,
                    text: "Ошибка",
                    code: "invalidData"
                });
            }
            return defered.promise;
        };
        o.removeComplex = function (comId) {
            if (comId !== "" && $rootScope.isAuth.uid) {
                complexesRef
                    .child($rootScope.isAuth.uid+"/"+comId).remove(function () {
                    defered.resolve({
                        res: true
                    });
                });
            } else {
                defered.reject({
                    res: false,
                    text: "Ошибка",
                    code: "invalidData"
                });
            }
            return defered.promise;
        };
        return o;
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
