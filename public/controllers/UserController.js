/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("UserController", ["$rootScope", "$scope", "$location", "UserService", 'socket', function ($rootScope, $scope, $location, UserService, socket) {
    "use strict";
    $scope.user_edit = {};
    var ctrl = this;
    ctrl.previous = "/";
    $scope.login = function () {
        $rootScope.$broadcast('pageLoading:updated', true);
        UserService.login({username: $scope.login.username, password: $scope.login.password}, function (response) {

            $rootScope.$broadcast('pageLoading:updated', false);
            if (response.status === "SUCCESS") {
                $location.path(ctrl.previous);
            } else {
                $scope.error = response.data;
            }
        });
    };
    $scope.logout = function () {
        UserService.logout(function (response) {
        });
    };
    $scope.savePassword = function () {
        UserService.changePassword($scope.user_edit, function (response) {
            if (!response.error) {
                $scope.user_edit = {};
            }
        });
    };
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $rootScope.$broadcast('pageLoading:updated', false);
        ctrl.previous = fromState.url;
        if (!ctrl.previous) {
            ctrl.previous = "/";
        }
    });
}]);