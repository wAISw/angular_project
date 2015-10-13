;(function () {
    "use strict";

    angular
        .module('fitApp.fire', [
            'firebase'
        ])
        .factory('dbc', dbcFactory);

    // @ngInject
    function dbcFactory(FIREBASE_URL, $firebaseAuth) {
        var o = {};
        var reference = new Firebase(FIREBASE_URL);

        o.getRef = function(){
            return reference;
        };

        return o;
    }
})();