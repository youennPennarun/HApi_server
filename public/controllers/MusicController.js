/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("MusicController", ["$scope", "$rootScope", "$state", "SpotifyService", 'Artist', function ($scope, $rootScope, $state, SpotifyService, Artist) {
    'use strict';
    $scope.searchArtistResult = [];
    
    $scope.searchArtist = function () {
        if ($scope.searchArtistName && $scope.searchArtistName !== "") {
            SpotifyService.searchArtist($scope.searchArtistName, function (result) {
                $scope.searchArtistResult = result;
            });
        }
    };
    Artist.getMyArtists(function(data) {
    });
    $scope.seeArtist = function (artist) {
        $state.go("Artist", {source: "spotify", id: artist.id});
    };
}]);