/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("MainController", ["$scope", "$rootScope", "UserService", "MusicPlayerService", "socket", function ($scope, $rootScope, UserService, MusicPlayerService, socket) {
    "use strict";
    var ctrl = this;
    this.title = "bn";
    this.user = null;
    this.pi_logged_in = false;
    $scope.volume = 50;
    $scope.player = MusicPlayerService;
    UserService.getUser(function (response) {});


    $scope.$on('user:updated', function (event, data) {
        ctrl.user = data;
    });
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        ctrl.title = toState.name;
    });
    $rootScope.$on('pageLoading:updated', function (event, data) {
        ctrl.pageLoading = data;
    });

    $rootScope.$on("socket:connected", function () {
        socket.on("pi:logged-in", function () {
            ctrl.pi_logged_in = true;
        });
        socket.on("pi:logged-out", function () {
            ctrl.pi_logged_in = false;
        });
        socket.on('pi:is-logged-in', function (loggedIn) {
            ctrl.pi_logged_in = loggedIn;
        });
    });
}]);