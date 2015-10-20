/**
 * Паралах на дерективе
 */

;(function () {
    "use strict";

    angular
        .module('mainParallax', [])
        .directive('mainParallax', mainParallax);

    // @ngInject
    function mainParallax($window) {
        return {
            restrict: 'A',
            scope: {
                parallaxRatio: '@',
                parallaxInitVal: '@',
                parallaxCss: '@'
            },
            link: function (scope, elem, attr) {
                var cssKey,
                    cssValue,
                    isSpecialVal,
                    parallaxRatio,
                    parallaxInitVal,
                    parallaxCssVal,
                    parallaxOffset,
                    cssValArray;

                parallaxCssVal = attr.parallaxCss || 'top';
                cssValArray = parallaxCssVal.split(':');
                cssKey = cssValArray[0];
                cssValue = cssValArray[1];

                isSpecialVal = cssValue ? true : false;
                if (!cssValue) cssValue = cssKey;

                parallaxRatio = attr.parallaxRatio ? +attr.parallaxRatio : 1.1;
                parallaxInitVal = attr.parallaxInitVal ? +attr.parallaxInitVal : 0;

                elem.css(cssKey, parallaxInitVal + 'px');

                function _onScroll() {

                    var resultVal;
                    var calcVal = $window.pageYOffset * parallaxRatio + parallaxInitVal;

                    if (isSpecialVal) {
                        resultVal = '' + cssValue + '(' + calcVal + 'px)';
                    } else {
                        resultVal = calcVal + 'px';
                    }
                    elem.css(cssKey, resultVal);
                }

                $window.addEventListener('scroll', _onScroll);
            }
        };
    }


})();