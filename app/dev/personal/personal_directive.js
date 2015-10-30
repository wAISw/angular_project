(function () {
    'use strict';

    angular
        .module('fitApp.personal.directive', [
            'fitApp.auth',
            'fitApp.personal'
        ])
        .directive('profileImg', profileImg)
        .controller('complexDirectiveCtrl', complexDirectiveCtrl)
        .directive('changeInnerHtml', changeInnerHtmlDirective)
        .directive('addToComplex', addToComplexDirective)
        .directive('showComplexEserc', showComplexEsercDirective)
        .directive('activeComplex', activeComplexDirective)
        .directive('removeComplex', removeComplexDirective)
        .directive('deleteExerc', deleteExercDirective)
        .directive('showUserComplex', showUserComplexDirective);

    // @ngInject
    function complexDirectiveCtrl(Complex, $rootScope) {
        var s = this;
        s.getUserComplex = function () {
            if (!$rootScope.isAuth) {
                return "Пожалуйста авторизуйтесь";
            }
            return s.UserComplex = Complex.getComplex();
        };
        s.addToComplex = function (e2cObj) {
            return Complex.addToComplex(e2cObj);
        };
        s.getExercToComplex = function (comId) {
            return Complex.getExercToComplex(comId);
        };
        s.activateComplex = function (comId, activeFlag) {
            return Complex.activateComplex(comId, activeFlag);
        }
        s.removeComplex = function (comId) {
            return Complex.removeComplex(comId);
        }
    }

    // @ngInject
    function removeComplexDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: {
                uid: '=comId'
            },
            link: function (scope, elem, attr, ctrl) {
                elem.on('click', function () {
                    var comId = elem.data('com-id');
                    ctrl.removeComplex(comId)
                        .then(function (data) {
                            if (data.res) {
                                elem.closest('.effeckt-content').find('.effeckt-modal-close').click();
                            }
                        })
                        .catch(function (error) {
                            alert("Произошла ошибка, обратитесь к администратору сайта!");
                        });
                });
            }
        };
    }

    // @ngInject
    function activeComplexDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: {
                changeHtml: "=",
                uid: '@complexId',
                activeFlag: '=complexActive'
            },
            link: function (scope, elem, attr, ctrl) {
                var oldHtml = '';
                var elemLabel = $(elem.find("span.label"));
                elem.on('mouseover', function () {
                    oldHtml = elemLabel.html();
                    elemLabel.html(scope.changeHtml);
                });
                elem.on('mouseout', function () {
                    elemLabel.html(oldHtml);
                });
                var comId = scope.uid;
                elem.on("click", function () {
                    ctrl.activateComplex(comId, scope.activeFlag)
                        .then(function (data) {
                            if (data.res) {
                                elem.off('mouseover');
                                elem.off('mouseout');
                                setTimeout(function () {
                                    oldHtml = elemLabel.html();
                                    elem.on('mouseover', function () {
                                        oldHtml = elemLabel.html();
                                        elemLabel.html(scope.changeHtml);
                                    });
                                    elem.on('mouseout', function () {
                                        elemLabel.html(oldHtml);
                                    });
                                }, 100);
                            }
                        })
                        .catch(function (error) {
                            alert("Произошла ошибка, обратитесь к администратору сайта!");
                        });
                });
            }
        };
    }

    // @ngInject
    function showComplexEsercDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: {
                uid: '@complexId'
            },
            link: function (scope, elem, attr, ctrl) {
                var comId = scope.uid;
                elem.on("click", function () {
                    elem.attr('data-loading', true);
                    ctrl.getExercToComplex(comId)
                        .then(function (data) {
                            var exercLIst = '';
                            angular.forEach(data, function (el) {
                                exercLIst += '<li class="exerc" delete-exerc '+
                                             'data-exerc-id="'+el.$id+'">'+
                                             '<i class="fa fa-times"></i>' + el.name + '</li>';
                            });
                            elem.siblings('div.effeckt-wrap.effeckt-modal-wrap')
                                .find('div.effeckt-modal-content')
                                .html('<ul>' + exercLIst + '</ul>');
                            elem.siblings('span.effeckt-modal-button').click();
                            elem.removeAttr('data-loading');
                        });
                });
            }
        };
    }
    // @ngInject
    function deleteExercDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: {
                uid: '@exercId'
            },
            link: function (scope, elem, attr, ctrl) {
                console.log(scope);
                var comId = scope.uid;
                elem.on("click", function () {
                    console.log(scope);
                    //elem.attr('data-loading', true);
                    //ctrl.getExercToComplex(comId)
                    //    .then(function (data) {
                    //        var exercLIst = '';
                    //        angular.forEach(data, function (el) {
                    //            exercLIst += '<li class="exerc" data-exerc-id="'+el.$id+'"><i class="fa fa-times"></i>' + el.name + '</li>';
                    //        });
                    //        elem.siblings('div.effeckt-wrap.effeckt-modal-wrap')
                    //            .find('div.effeckt-modal-content')
                    //            .html('<ul>' + exercLIst + '</ul>');
                    //        elem.siblings('span.effeckt-modal-button').click();
                    //        elem.removeAttr('data-loading');
                    //    });
                });
            }
        }
    }
    // @ngInject
    function addToComplexDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: {
                uid: '@',
                exercUid: '@'
            },
            link: function (scope, elem, attr, ctrl) {
                elem.on("click", function () {
                    ctrl.addToComplex({"exerc": attr.exercUid, "com": attr.uid})
                        .then(function (data) {
                            if (data.res) {
                                $(elem)
                                    .find('i')
                                    .addClass('null')
                                    .removeClass('fa-plus-circle')
                                    .addClass('fa-minus-circle')
                                    .addClass('normal');
                                setTimeout(function () {
                                    $(elem)
                                        .find('i')
                                        .removeClass('null');
                                }, 200);
                            }
                        })
                        .catch(function (error) {
                            alert("Произошла ошибка, обратитесь к администратору сайта!");
                        });
                });
            }
        };
    }

    // @ngInject
    function showUserComplexDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: true,
            link: function (scope, elem, attr, ctrl) {
                elem.mouseover(function () {
                    ctrl.getUserComplex().$loaded().then(function (data) {
                        var list = '';
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            list += '<li><span class="add" data-com-uid="' + item.$id + '">' + item.name + '</span></li>';
                        }
                        elem.find('.user-complex-list ul')
                            .html(list);
                    });
                });
            }
        };
    }


    // @ngInject
    function changeInnerHtmlDirective($window) {
        return {
            restrict: 'A',
            scope: {
                changeHtml: "@"
            },
            link: function (scope, elem, attr, ctrl) {
                var oldHtml = '';
                var elemLabel = $(elem.find("span.label"));
                elem.mouseover(function () {
                    oldHtml = elemLabel.html();
                    elemLabel.html(attr.changeHtml);
                });
                elem.mouseout(function () {
                    elemLabel.html(oldHtml);
                });
                //console.log(elem);
                //elem.click(_onClick);
            }
        };
    }

    /* @ngInject */
    function profileImg() {
        return {
            restrict: "A",
            template: '<img src="{{pic.user.avatar}}" />'
        };
    }

})();

