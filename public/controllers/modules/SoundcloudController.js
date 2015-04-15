/*jslint browser: true*/
/*jslint es5: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("SoundcloudController", ["$scope", "$http", "$modal", "GCalendarService", function ($scope, $http, $modal, GCalendarService) {
    "use strict";
    $scope.calendar = {};
    GCalendarService.get().success(function (result) {
        $scope.calendar = result.data;
    });

}]);

/*
14535304
*/