/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global $*/
haPi.service("SoundcloudService", [ "$http", function ($http) {
    'use strict';
    this.isSignedIn = function () {
        return $http.get("/api/soundcloud/isSignedIn");
    };
    this.getLoginUrl = function () {
        return $http.get("/api/soundcloud/url");
    };
    this.signOut = function () {
        return $http.get("/api/soundcloud/sign-out");
    };
}]);