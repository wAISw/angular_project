(function () {
    'use strict';

    angular
        .module('fitApp.personal.directive',[
            'fitApp.auth'
        ])
        .directive('profileImg', profileImg);

    /* @ngInject */
    function profileImg() {
        return {
            restrict: "A",
            template:'<img src="{{pic.user.avatar}}" />'
        };
    }

})();

