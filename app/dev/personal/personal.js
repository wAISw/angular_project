;(function () {
    "use strict";

    angular
        .module('fitApp.personal', [
            'ui.router',
            'fitApp.fire',
            'fitApp.navbar',
            'fitApp.auth',
            'infinite-scroll',
            'fitApp.personal.directive',
            'n3-line-chart'
        ])
        .config(PersonalConfig)
        .controller('PersonalIndexCtrl', PersonalIndexCtrl)
        .factory('UserRepository', UserRepositoryFactory)
        .factory('UserProfile', UserProfileFactory)
        .factory('Exercises', ExercisesFactory)
        .factory("Complex", ComplexFactory)
        .factory("Statistic", StatisticFactory)
        .controller('PersonalComplexCtrl', PersonalComplexCtrl)
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
            .state('Statistics', {
                url: '/personal/statistics',
                templateUrl: 'personal/partial-statistics.html',
                controller: 'PersonalStatisticsCtrl',
                controllerAs: 'static'
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
    function StatisticFactory(dbc, $firebaseArray, $rootScope, $state) {
        var o = {};
        var ref = dbc.getRef();
        var userDate = ref.child('exercises_counts');
        o.getData = function () {
            if (!$rootScope.isAuth) {
                $state.go("Auth");
            } else {
                return $firebaseArray(userDate.child($rootScope.isAuth.uid)).$loaded();
            }
        };
        return o;
    }

    // @ngInject
    function ExercisesFactory(dbc, $firebaseArray) {
        var o = {};
        var ref = dbc.getRef();
        o.getAllExercises = function () {
            return $firebaseArray(ref.child('exercises')).$loaded();
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
            if(s.addComplexForm.ComplexName!="") {
                Complex
                    .addNewComplex(s.addComplexForm)
                    .then(function (data) {
                        $rootScope.addAlert("success", "Комплекс успешно добавлен.");
                    }).catch(function (error) {
                    $rootScope.closeAlert();
                    switch (error.code) {
                        case "needAuth":
                            $rootScope.addAlert("danger", error.text);
                            break;
                    }
                });
            }else{
                $rootScope.addAlert("danger", "Заполните название комплекса.");
            }
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
        var exercCount = ref.child('exercises_counts');
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
                    //active: newComplex.ComplexActive
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
                    .child($rootScope.isAuth.uid + "/" + comId).remove(function () {
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
        o.removeExerc = function (comId, exercId) {
            if (comId !== "" && exercId !== "" && $rootScope.isAuth.uid) {
                complexToExerc
                    .child($rootScope.isAuth.uid + "/" + comId + "/" + exercId).remove(function () {
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
        o.getExerc = function (exId) {
            if (exId !== "" && $rootScope.isAuth.uid) {
                return $firebaseObject(exercList
                    .child(exId)).$loaded();
            } else {
                defered.reject({
                    res: false,
                    text: "Ошибка",
                    code: "invalidData"
                });
                return defered.promise;
            }
        };
        o.startWorkout = function (comId) {
            if (comId !== "" && $rootScope.isAuth.uid) {
                return $firebaseArray(complexToExerc
                    .child($rootScope.isAuth.uid + "/" + comId)).$loaded();
            } else {
                defered.reject({
                    res: false,
                    text: "Ошибка",
                    code: "invalidData"
                });
                return defered.promise;
            }
        };
        o.setExercCount = function (comId, exId, count) {
            //console.log(count);
            if (comId !== "" && $rootScope.isAuth.uid) {
                var date = Math.floor(new Date() / 1000);
                var obj = {};
                obj[date] = count;
                exercCount
                    .child($rootScope.isAuth.uid + "/" + comId + "/" + exId).update(obj,
                    function () {
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
    function PersonalStatisticsCtrl(Statistic, Exercises, Complex) {
        var s = this;

        function cc() {
            var r = Math.floor(Math.random() * (256));
            var g = Math.floor(Math.random() * (256));
            var b = Math.floor(Math.random() * (256));
            return '#' + r.toString(16) + g.toString(16) + b.toString(16);
        }

        s.title = "Моя статистика";
        s.data_exerc = {};
        s.options_exerc = {};
        s.myComplex = {};
        Complex.getComplex()
            .$loaded()
            .then(function (data) {
                    angular.forEach(data, function (arCom) {
                        s.myComplex[arCom.$id] = arCom.name;
                    });
                }
            );
        Exercises.getAllExercises().then(function (exercisesList) {
            s.exercisesList = exercisesList;
            Statistic.getData().then(function (data) {
                angular.forEach(data, function (el) {
                    s.data_exerc[el.$id] = {};
                    s.options_exerc[el.$id] = {};
                    var series = [];
                    angular.forEach(el, function (exerc, exId) {
                        s.options_exerc[el.$id][exId] = {
                            axes: {
                                x: {
                                    key: "x",
                                    labelFunction: function (v) {
                                        if (parseInt(v) != v) {
                                            return '';
                                        } else {
                                            return v + ' занятие';
                                        }
                                    }
                                }
                            },
                            lineMode: "cardinal",
                            series: [{
                                y: "val_" + exId,
                                label: exercisesList[exId].name,
                                type: "area",
                                striped: true,
                                color: cc()
                            }]
                        };
                        s.data_exerc[el.$id][exId] = [];
                        var i = 1;
                        angular.forEach(exerc, function (count, time) {
                            var obj = {};
                            obj['x'] = i;
                            obj["val_" + exId] = count * 1;
                            s.data_exerc[el.$id][exId].push(obj);
                            i++;
                        });

                    });
                });
                //console.log(data);
                //console.log(s.data_exerc);
                //console.log(s.options_exerc);
            });
        });
    }

    // @ngInject
    function PersonalWorkoutCtrl(Complex, $state) {
        var s = this;
        s.title = "Тренировка";
        s.complexList = Complex.getComplex();
        s.plusOne = function () {
            var currentVal = parseInt($("#exerc-val").val());
            //console.log(currentVal);
            currentVal = currentVal + 1;
            $("#exerc-val").val(currentVal);
            $("#exerc-val").siblings(".exerc-count").html(currentVal);
        };
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
