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
        .directive('startWorkout', startWorkoutDirective)
        .directive('buildGraph', buildGraphDirective)
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
        s.getExerc = function (exId) {
            return Complex.getExerc(exId);
        };
        s.activateComplex = function (comId, activeFlag) {
            return Complex.activateComplex(comId, activeFlag);
        };
        s.removeComplex = function (comId) {
            return Complex.removeComplex(comId);
        };
        s.removeExerc = function (comId, exercId) {
            return Complex.removeExerc(comId, exercId);
        };
        s.startWorkout = function (comId) {
            return Complex.startWorkout (comId);
        };
        s.setExercCount = function (comId, exId, count) {
            return Complex.setExercCount (comId, exId, count);
        };
    }

    // @ngInject
    function buildGraphDirective() {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            link: function (scope, elem, attr, ctrl) {

            }
        };
    }

    // @ngInject
    function startWorkoutDirective($state, $rootScope) {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            link: function (scope, elem, attr, ctrl) {
                $(".reset-complex-wrap").click(function (k, el) {
                    elem.closest('.set-complex-wrap').slideDown(200);
                    $(".reset-complex-wrap").slideUp(200);
                });
                var exKey = 0;
                var exercArray = [];
                elem.on('click', function () {
                    var comId = $("select#complex-name").val();
                    if(comId==null){
                        $rootScope.$apply($rootScope.addAlert("danger", "Сначала, нужно добавить комплес, и упражнения."));
                        return false;
                    }
                    elem.closest('.set-complex-wrap').slideUp(200);
                    $(".reset-complex-wrap").slideDown(200);
                    ctrl.startWorkout(comId)
                        .then(function (data) {
                            angular.forEach(data, function (el, k) {
                                exercArray.push(k);
                            });
                            // получим упражнение
                            ctrl.getExerc(exercArray[exKey])
                                .then(function (exData) {
                                    $('#current-exerc div.panel-heading h4').html(exData.name);
                                    $('#current-exerc div.panel-body span.exerc-count').html(0);
                                    $('#current-exerc div.panel-body input#exerc-val').val(0);
                                    $('#current-exerc').slideDown(200);
                                });
                        })
                        .catch(function (error) {
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));

                        });
                });
                $(".next-exerc").on('click', function () {
                    if (exercArray.length <= exKey) {
                        return false;
                    }
                    var comId = $("select#complex-name").val();
                    var count = $("#exerc-val").val();
                    ctrl.setExercCount(comId, exercArray[exKey], count)
                        .then(function (data) {
                            if (data.res) { // Полчим следующее упражнение
                                exKey++;
                                ctrl.getExerc(exercArray[exKey])
                                    .then(function (exData) {
                                        $('#current-exerc div.panel-heading h4').html(exData.name);
                                        $('#current-exerc div.panel-body span.exerc-count').html(0);
                                        $('#current-exerc div.panel-body input#exerc-val').val(0);
                                        if (exKey > 0) {
                                            $(".prew-exerc").removeClass('non-active');
                                        }
                                        if (exercArray.length - 1 <= exKey) {
                                            $(".next-exerc").addClass('non-active');
                                        }
                                    });
                            }
                        })
                        .catch(function (error) {
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
                        });
                });
                $(".prew-exerc").on('click', function () {
                    if (exKey == 0) {
                        return false;
                    }
                    var comId = $("select#complex-name").val();
                    var count = $("#exerc-val").val();
                    ctrl.setExercCount(comId, exercArray[exKey], count)
                        .then(function (data) {
                            if (data.res) { // Полчим следующее упражнение
                                exKey--;
                                ctrl.getExerc(exercArray[exKey])
                                    .then(function (exData) {
                                        $('#current-exerc div.panel-heading h4').html(exData.name);
                                        $('#current-exerc div.panel-body span.exerc-count').html(0);
                                        $('#current-exerc div.panel-body input#exerc-val').val(0);
                                        if (exKey == 0) {
                                            $(".prew-exerc").addClass('non-active');
                                        }
                                        if (exercArray.length - 1 > exKey) {
                                            $(".next-exerc").removeClass('non-active');
                                        }
                                    });
                            }
                        })
                        .catch(function (error) {
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
                        });
                });
                $("#end_workout").on('click', function () {
                    var comId = $("select#complex-name").val();
                    var count = $("#exerc-val").val();
                    ctrl.setExercCount(comId, exercArray[exKey], count)
                        .then(function (data) {
                            $state.go("Statistics");
                        })
                        .catch(function (error) {
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
                        });
                });
            }
        };
    }

    // @ngInject
    function removeComplexDirective($rootScope) {
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
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
                        });
                });
            }
        };
    }

    // @ngInject
    function activeComplexDirective($rootScope) {
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
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
                        });
                });
            }
        };
    }

    // @ngInject
    function showComplexEsercDirective($compile) {
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
                                exercLIst += '<li class="exerc" delete-exerc ' +
                                    'data-exerc-id="' + el.$id + '">' +
                                    '<i class="fa fa-times"></i>' + el.name + '</li>';
                            });
                            $compile(elem.siblings('div.effeckt-wrap.effeckt-modal-wrap')
                                .find('div.effeckt-modal-content')
                                .html('<ul>' + exercLIst + '</ul>')
                            )(scope);
                            elem.siblings('span.effeckt-modal-button').click();
                            elem.removeAttr('data-loading');
                        });
                });
            }
        };
    }

    // @ngInject
    function deleteExercDirective($rootScope) {
        return {
            restrict: 'A',
            controller: 'complexDirectiveCtrl',
            scope: {
                uid: '@exercId'
            },
            link: function (scope, elem, attr, ctrl) {
                var comId = elem.closest(".effeckt-modal-wrap").attr("id").replace("complex", '');
                elem.on("click", function () {
                    ctrl.removeExerc(comId, scope.uid)
                        .then(function (data) {
                            elem.remove();
                        })
                        .catch(function (error) {
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
                        });
                });
            }
        }
    }

    // @ngInject
    function addToComplexDirective($rootScope) {
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
                            $rootScope.$apply($rootScope.addAlert("danger", "Произошла ошибка, обратитесь к администратору сайта."));
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

