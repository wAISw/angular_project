;(function () {
    "use strict";

    angular
        .module('trackerApp.auth', [
            'trackerApp.fire',
            'trackerApp.personal'
        ])
        .config(authConfig)
        .factory('Authentication', AuthenticationFactory)
        .controller('AuthCtrl', AuthCtrl);


    // @ngInject
    function authConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('Auth', {
                url: '/auth',
                templateUrl: 'auth/auth.html',
                controller: 'AuthCtrl',
                controllerAs: 'ac'
            })
            .state('Register', {
                url: '/register',
                templateUrl: 'auth/register.html',
                controller: 'AuthCtrl',
                controllerAs: 'ac'
            })
            .state('ChangePass', {
                url: '/change-password',
                templateUrl: 'auth/change_password.html',
                controller: 'AuthCtrl',
                controllerAs: 'ac'
            })
            .state('AddUser', {
                url: '/add-user',
                templateUrl: 'auth/add_user.html',
                controller: 'AuthCtrl',
                controllerAs: 'ac'
            });
    }

    // @ngInject
    function AuthCtrl(dbc, $firebaseArray, UserRepository, $rootScope, Authentication) {
        var s = this;
        var resetObj = function (obj) {
            for (var prop in obj) {
                obj['' + prop + ''] = "";
            }
            return obj;
        };
        var users = UserRepository.getAllUsers();
        users.$loaded(function (_usersList) {
            s.users = _usersList;
        });

        s.newUser = {
            name: '',
            email: ''
        };
        s.createUser = {
            email: '',
            password: '',
            pass_confirm: ''
        };
        s.changePassword = {
            email: '',
            oldPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
        };
        s.authUserInf = {
            email: '',
            password: ''
        };

        s.addNewUser = function () {
            UserRepository
                .addNewUser(s.newUser)
                .then(function (ref) {
                    $rootScope.addAlert("success", "Пользователь успешно добавлен.");
                });
            s.newUser = {
                name: '',
                email: ''
            };
        };
        s.registerUser = function () {
            if (s.createUser.password === s.createUser.pass_confirm) {
                Authentication.register(s.createUser).then(function (authData) {
                    resetObj(s.createUser);
                    $rootScope.addAlert("success", "Вы успешно зарегистрированы, и авторизованы!");
                }).catch(function (error) {
                    console.error("Error: ", error);
                });
            }
        };
        s.authUser = function () {
            Authentication.authObj(s.authUserInf)
                .then(function (authData) {
                    resetObj(s.authUserInf);
                    $rootScope.closeAlert();
                    $rootScope.addAlert("success", "Вы успешно авторизованы!");
                }).catch(function (error) {
                console.log(error);
                // Сбросим пароль
                s.authUserInf.password = '';
                $rootScope.addAlert("danger", "Email или пароль не верны!");
            });
        };
        s.getAuth = Authentication.getAuth();
        s.logOut = function () {
            Authentication.logOut();
        };
        s.changePassword = function () {
            console.log(s.changePassword);
            Authentication.changePassword(s.changePassword).then(function () {
                resetObj(s.changePassword);
                $rootScope.closeAlert();
                $rootScope.addAlert("success", "Пароль успешно изменен!");
            }).catch(function (error) {
                console.log(error);
                $rootScope.addAlert("danger", "Пароль не изменен!");
            });
        };
    }

    // @ngInject
    function AuthenticationFactory($firebaseAuth, dbc) {
        var o = {};
        var auth = $firebaseAuth(dbc.getRef());
        o.authObj = function (authUserInf) {
            return auth.$authWithPassword(authUserInf);
        };
        o.getAuth = function () {
            return auth.$getAuth();
        };
        o.logOut = function () {
            auth.$onAuth(function (authData) {
                auth.$unauth();
                console.log('logged out');
            });
        };
        o.register = function (newUser) {
            return auth.$createUser(newUser)
                .then(function (userData) {
                    return auth.$authWithPassword(newUser);
                });
        };
        o.changePassword = function (changePass) {
            return auth.$changePassword(changePass);
        };
        return o;
    }
})();