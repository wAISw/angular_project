;(function(){
    "use strict";

    angular
        .module('fitApp.navbar', [
            'fitApp.auth'
        ])
        .controller('navbarCtrl', navbarCtrl);

    // @ngInject
    function navbarCtrl($rootScope, Authentication) {
        var s = this;
        s.logOut = function () {
            Authentication.logOut();
        }
    }


})();