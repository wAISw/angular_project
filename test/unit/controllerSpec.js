'use strict';

/* jasmine specs for controllers go here */
describe('trackerApp', function() {
    var $scope;
    var controller;
    describe('trackerApp public controllers', function(){

        beforeEach(function(){
            module('trackerApp');
            inject(function(_$rootScope_, $controller) {

                $scope = _$rootScope_.$new();
                controller = $controller("UsersCtrl", {$scope: $scope});

            });
        });

        it("Проверим что в контролере есть заголовок", function() {
            expect(controller.title).toBeTruthy();
        });

    });
});
