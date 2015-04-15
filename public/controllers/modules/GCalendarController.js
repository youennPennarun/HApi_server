/*jslint browser: true*/
/*jslint es5: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("GCalendarController", ["$scope", "$http", "$modal", "GCalendarService", function ($scope, $http, $modal, GCalendarService) {
    "use strict";
    $scope.calendar = {};
    $scope.error = false;
    GCalendarService.get(function (response) {
        if (response.status === "SUCCESS") {
            $scope.calendar = response.data;
        } else {
            $scope.error = response.error;
        }
    });

}]);