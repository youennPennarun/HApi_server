/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global $*/
haPi.service("EchonestService", [ "$http", "RequestService", function ($http, RequestService) {
    'use strict';
    this.searchSimilarArtist = function (name, callback) {
        RequestService.get("/api/echonest/artist/similar/" + name, {}, function (response) {
            callback(response);
        });
    };
    this.searchSongByArtist = function (name, callback) {
        RequestService.get("/api/echonest/song/search/", {artist:name}, function (response) {
            callback(response);
        });
    };
    this.getSimilarPlaylist = function (name, callback) {
        var promise = []
        RequestService.get("api/echonest/artist/similarSong/"+name, {}, function (response) {
            callback(response);
        });
    };

}]);