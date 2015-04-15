/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global $*/
haPi.service("SpotifyService", [ "$http", "RequestService", function ($http, RequestService) {
    'use strict';
    this.isSignedIn = function (callback) {
        RequestService.get("/api/spotify/isSignedIn", {},  callback);
    };
    this.getLoginUrl = function (callback) {
        RequestService.get("/api/spotify/sign-in/url", {},  callback);
    };
    this.signOut = function (callback) {
        //RequestService.get("/api/google-auth/sign-out", {},  callback);
    };
    this.searchArtist = function (artistName, callback) {
        RequestService.get("/api/spotify/search/artist/" + artistName, {},  function (result) {
            callback(result.data.result.artists.items);
        });
    };
    this.getArtist = function (id, callback) {
        RequestService.get("/api/spotify/artist/" + id, {},  function (result) {
            callback(result);
        });
    };
}]);