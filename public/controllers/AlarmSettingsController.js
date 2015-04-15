/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("AlarmSettingsController", ["$scope", "$rootScope", "$state", "$stateParams", "MusicPlayerService", "Artist", function ($scope, $rootScope, $state, $stateParams, MusicPlayerService, Artist) {
    "use strict";
    $scope.artists = [];
    Artist.getMyArtists(function (data) {
        if (data.status === "SUCCESS") {
            $scope.artists = data.data.artists;
        }
    });

    $scope.refreshArtists = function () {
        Artist.refreshMyArtists(function (data) {
            if (data.status === "SUCCESS") {
                $scope.artists = data.data.artists;
            }
        });
    };

}]);