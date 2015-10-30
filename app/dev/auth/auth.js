;(function () {
    "use strict";

    angular
        .module('fitApp.auth', [
            'fitApp.fire',
            'fitApp.personal'
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
            .state('ChangePassword', {
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
            })
            .state('ResetPassword', {
                url: '/reset-password',
                templateUrl: 'auth/reset_pass.html',
                controller: 'AuthCtrl',
                controllerAs: 'ac'
            });
    }

    // @ngInject
    function AuthCtrl($state, dbc, $firebaseArray, UserRepository, $rootScope, Authentication) {
        // Проверим, если пользователь авторизован,
        // то запретим ему посещение
        // страниц авторизации и регистрации
        if ($rootScope.isAuth !== null) {
            switch ($state.current.name) {
                case 'Auth':
                    $state.go("Personal", {id: $rootScope.isAuth.uid});
                    break;
                case 'Register':
                    $state.go("Personal", {id: $rootScope.isAuth.uid});
                    break;
            }
        }

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
            fullName: '',
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
                    $rootScope.isAuth = authData;
                    $rootScope.userInf = Authentication.getUser(authData);
                    $state.go("Personal", {id: authData.uid});
                }).catch(function (error) {
                    $rootScope.isAuth = false;
                    Authentication.deleteUserInf();
                    $rootScope.closeAlert();
                    switch (error.code) {
                        case "INVALID_EMAIL":
                            $rootScope.addAlert("danger", "Некорректно введен Email");
                            break;
                        case "INVALID_PASSWORD":
                            $rootScope.addAlert("danger", "Неверный Email или пароль!");
                            break;
                        case "INVALID_USER":
                            $rootScope.addAlert("danger", "Неверный Email или пароль!");
                            break;
                        default:
                            $rootScope.addAlert("danger", "Упс! Что то пошло не так, попробуйте еще раз!");
                    }
                });
            }
        };
        s.authUser = function () {
            Authentication.authObj(s.authUserInf)
                .then(function (authData) {
                    resetObj(s.authUserInf);
                    $rootScope.closeAlert();
                    $rootScope.isAuth = authData;
                    $rootScope.userInf = Authentication.getUser(authData);
                    $state.go("Personal", {id: authData.uid});
                }).catch(function (error) {
                Authentication.deleteUserInf();
                $rootScope.closeAlert();
                switch (error.code) {
                    case "INVALID_EMAIL":
                        $rootScope.addAlert("danger", "Неверный Email или пароль!");
                        break;
                    case "INVALID_PASSWORD":
                        $rootScope.addAlert("danger", "Неверный Email или пароль!");
                        break;
                    case "INVALID_USER":
                        $rootScope.addAlert("danger", "Неверный Email или пароль!");
                        break;
                    default:
                        $rootScope.addAlert("danger", "Упс! Что то пошло не так, попробуйте еще раз!");
                }
                // Сбросим пароль
                s.authUserInf.password = '';
            });
        };
        s.logOut = function () {
            Authentication.logOut();
            $rootScope.userInf = {};
            $rootScope.isAuth = null;
        };
        s.resetPassword = function () {
            Authentication.resetPassword(s.authUserInf)
                .then(function () {
                    $rootScope.closeAlert();
                    $rootScope.addAlert("success", "Новый пароль выслан вам на Email.");
                }).catch(function (error) {
                switch (error.code) {
                    case "INVALID_USER":
                        $rootScope.closeAlert();
                        $rootScope.addAlert("danger", "Такого пользователя не существует!");
                        break;
                    default:
                        $rootScope.closeAlert();
                        $rootScope.addAlert("danger", "Упс! Что то пошло не так, попробуйте еще раз!");
                }
            });
        };
        s.changePassword = function () {
            if (s.changePassword.newPassword == s.changePassword.newPasswordConfirm) {
                Authentication.changePassword(s.changePassword).then(function () {
                    resetObj(s.changePassword);
                    $rootScope.closeAlert();
                    $rootScope.addAlert("success", "Пароль успешно изменен!");
                }).catch(function (error) {
                    $rootScope.closeAlert();
                    switch (error.code) {
                        case "INVALID_USER":
                            $rootScope.addAlert("danger", "Такого пользователя не существует!");
                            break;
                        case "INVALID_PASSWORD":
                            $rootScope.addAlert("danger", "Неверный пароль!");
                            break;
                        default:
                            $rootScope.addAlert("danger", "Пароль не изменен!");
                    }
                });
            } else {
                $rootScope.addAlert("danger", "Подтверждение пароля не верно!");
            }
        };
        s.fbAuth = function () {
            Authentication
                .fbAuth().then(function (authData) {
                $rootScope.closeAlert();
                $state.go("Personal", {id: $rootScope.userInf.uid});
            });
        };
        s.fbRegister = function () {
            Authentication
                .fbRegister().then(function (authData) {
                $rootScope.closeAlert();
                $state.go("Personal", {id: $rootScope.userInf.uid});
            });
        };
        s.googleAuth = function () {
            Authentication
                .googleAuth().then(function (authData) {
                $rootScope.closeAlert();
                $state.go("Personal", {id: $rootScope.userInf.uid});
            });
        };
        s.googleRegister = function () {
            Authentication
                .googleRegister().then(function (authData) {
                $rootScope.closeAlert();
                $state.go("Personal", {id: $rootScope.userInf.uid});
            });
        };
    }

    // @ngInject
    function AuthenticationFactory($state, $firebaseArray, $firebaseObject, $firebaseAuth, dbc, $rootScope) {
        var o = {};
        var ref = dbc.getRef();
        var auth = $firebaseAuth(ref);
        var usersRef = ref.child('users');
        o.getAuth = function () {
            return auth.$getAuth();
        };
        o.requireAuth = function () {
            return auth.$requireAuth();
        };
        o.deleteUserInf = function () {
            $rootScope.isAuth = null;
            $rootScope.userInf = null;
        };
        o.authObj = function (authUserInf) {
            return auth.$authWithPassword(authUserInf);
        };
        o.logOut = function () {
            auth.$onAuth(function (authData) {
                auth.$unauth();
            });
            $state.go("Home");
            o.deleteUserInf();
        };
        o.register = function (newUser) {
            return auth.$createUser({
                    email: newUser.email,
                    password: newUser.password
                })
                .then(function (userData) {
                    usersRef.child(userData.uid).set({
                        fullName: newUser.fullName,
                        email: newUser.email,
                        dateCreate: Firebase.ServerValue.TIMESTAMP
                    });
                    return auth.$authWithPassword(newUser);
                });
        };
        o.getUser = function (userData) {
            return $firebaseObject(usersRef.child(userData.uid));
        };
        o.resetPassword = function (userArray) {
            return auth.$resetPassword({
                email: userArray.email
            });
        };
        o.changePassword = function (changePass) {
            return auth.$changePassword(changePass);
        };
        o.fbRegister = function () {
            return auth.$authWithOAuthPopup("facebook")
                .then(function (authData) {
                    usersRef.child(authData.uid).set({
                        fullName: authData.facebook.displayName,
                        email: null,
                        facebookId: authData.facebook.id,
                        avatar: authData.facebook.profileImageURL,
                        dateCreate: Firebase.ServerValue.TIMESTAMP
                    });
                    $rootScope.isAuth = authData;
                    $rootScope.userInf = {
                        fullName: authData.facebook.displayName,
                        uid: authData.uid,
                        email: null
                    };
                });
        };
        o.fbAuth = function () {
            return auth.$authWithOAuthPopup("facebook")
                .then(function (authData) {
                    $rootScope.isAuth = authData;
                    $rootScope.userInf = {
                        fullName: authData.facebook.displayName,
                        uid: authData.uid,
                        email: null
                    };
                });
        };
        o.googleRegister = function () {
            return auth.$authWithOAuthPopup("google")
                .then(function (authData) {
                    usersRef.child(authData.uid).set({
                        fullName: authData.google.displayName,
                        email: null,
                        facebookId: authData.google.id,
                        avatar: authData.google.profileImageURL,
                        dateCreate: Firebase.ServerValue.TIMESTAMP
                    });
                    $rootScope.isAuth = authData;
                    $rootScope.userInf = {
                        fullName: authData.google.displayName,
                        uid: authData.uid,
                        email: null
                    };
                });
        };
        o.googleAuth = function () {
            return auth.$authWithOAuthPopup("google").then(function (authData) {
                $rootScope.isAuth = authData;
                $rootScope.userInf = {
                    fullName: authData.google.displayName,
                    uid: authData.uid,
                    email: null
                };
            });
        };
        // Проверим авторизован ли пользователь
        $rootScope.isAuth = o.getAuth();

        if ($rootScope.isAuth) {
            $rootScope.userInf = o.getUser($rootScope.isAuth);
        }
        return o;
    }
})();