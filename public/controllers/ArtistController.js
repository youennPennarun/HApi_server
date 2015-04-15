/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("ArtistController", ["$scope", "$rootScope", "$state", "$stateParams", "MusicPlayerService", "Artist", function ($scope, $rootScope, $state, $stateParams, MusicPlayerService, Artist) {
    "use strict";
    var artist = new Artist($stateParams.id, $stateParams.source);
    artist.get(function (response) {
        $scope.artist = response.data.artist;
        $scope.setFunctions();
    });

    $scope.msToTime = function (ms){
        return  (ms/60000).toFixed(2);
    }

    $scope.setFunctions = function () {
        $(".track-line").hover(function() {
            $(this).css("background-color","#9e9e9e")
        });
    };
    $scope.playAlbum = function (album, startingTrack) {
        var startingKey = 0;
        var track = {list: album.tracks.items.slice(0)};
        $.each(album.tracks.items, function (key, value) {
            if(startingTrack == value) {
                startingKey = key;
            }
        });
        if (startingKey > 0) {
            track.list.splice(0, startingKey-1);
        }
        MusicPlayerService.play(track);
    };
    
}]);