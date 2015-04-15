/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global $*/
haPi.factory("Artist", [ "$http", "$cacheFactory", "RequestService", "SpotifyService", function ($http, $cacheFactory, RequestService, SpotifyService) {
    'use strict';
    
    var Artist = function (id, source, name, img, albums, top_tracks) {
        this.source = source;
        this.id = id;
        this.name = name;
        this.img = img;
    };
    Artist.cache = $cacheFactory('artist');
    Artist.saved = null;
    
    Artist.prototype.get = function (callback) {
        if (this.source === "spotify") {
            SpotifyService.getArtist(this.id, callback);
        }
    };
    Artist.getMyArtists = function (callback) {
        RequestService.get("/api/artists/my", {}, callback);
    }
    Artist.refreshMyArtists = function (callback) {
        RequestService.get("/api/artists/refresh", {}, callback);
    }
    return Artist;

}]);