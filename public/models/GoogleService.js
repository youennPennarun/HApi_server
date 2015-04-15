/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global $*/
haPi.service("GoogleService", [ "$http", "RequestService", function ($http, RequestService) {
    'use strict';
    this.isSignedIn = function (callback) {
        RequestService.get("/api/google-auth/isSignedIn", {},  callback);
    };
    this.getLoginUrl = function (callback) {
        RequestService.get("/api/google-auth/url", {},  callback);
    };
    this.signOut = function (callback) {
        RequestService.get("/api/google-auth/sign-out", {},  callback);
    };
}]);