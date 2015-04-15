/*jslint browser: true*/
/*jslint es5: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("EchonestController", ["$scope", "$http", '$sce', "$modal", "EchonestService", function ($scope,$sce, $http, $modal, EchonestService) {
    "use strict";
    $scope.artistList = {};
    $scope.trackListStr = null;
    $scope.searchSimilarArtist = function (name) {
        EchonestService.getSimilarPlaylist(name, function(data) {
            var ids =  [];
            $.each(data.data.data, function(k, value) {
                ids.push(value.split(":")[2]);
            });
            var url = "https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:" + ids.join();
            $scope.trackListStr = url;
        });
    };
}]);

/*
14535304
*/