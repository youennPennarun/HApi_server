/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("SettingsController", ['$scope', '$rootScope', '$window', 'GoogleService', 'SpotifyService', 'socket', function ($scope, $rootScope, $window, GoogleService, SpotifyService, socket) {
    'use strict';
    $scope.googleService = {};
    $scope.soundcloudService = {};
    $scope.spotify = {};
    $scope.raspberry = {};
    $scope.cpu_labels = ['','','','','','','','','','','','','','']
    $scope.cpu_data = [
        [0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0]
    ];

    socket.emit("pi:ip:get");
    socket.on("pi:ip:get", function (data) {
        $scope.raspberry.ip = data.ip;
    });
    socket.on("pi:cpu", function (data) {
        var i = 0;
        $scope.raspberry.cpu = data.cpu;
        for (i = 1; i < $scope.cpu_data[0].length; i += 1) {
            $scope.cpu_data[0][i - 1 ] = $scope.cpu_data[0][i];
            
        }
        $scope.cpu_data[0][$scope.cpu_data[0].length - 1] = data.cpu;
    });

    $rootScope.$broadcast('pageLoading:updated', true);

    var waiting = 2;
    GoogleService.isSignedIn(function (result) {
        waiting -= 1;
        $scope.googleService.isSignedIn = result.data.signed_in;
        if (result.data.signed_in) {
            $scope.googleService.user_info = result.data.user_info;
        }
        if (!waiting) {
            $rootScope.$broadcast('pageLoading:updated', false);
        }
    });
    SpotifyService.isSignedIn(function (result) {
        waiting -= 1;
        $scope.spotify.isSignedIn = result.data.signed_in;
        if (result.data.signed_in) {
            $scope.spotify.user_info = result.data.user_info;
        }
        if (!waiting) {
            $rootScope.$broadcast('pageLoading:updated', false);
        }
    });


    $scope.google_signIn = function () {
        GoogleService.getLoginUrl(function (result) {
            $window.open(result.data.connect_url);
            GoogleService.isSignedIn().success(function (result) {
                $scope.googleService.isSignedIn = result.data.signed_in;
            });
        });
    };
    $scope.google_signOut = function () {
        GoogleService.signOut(function (result) {
            GoogleService.isSignedIn().success(function (result) {
                $scope.googleService.isSignedIn = result.data.signed_in;
            });
        });
    };

    $scope.spotify_signIn = function () {
        SpotifyService.getLoginUrl(function (result) {
            $window.open(result.data.connect_url);
            SpotifyService.isSignedIn(function (result) {
                $scope.spotify.isSignedIn = result.data.signed_in;
            });
        });
    };
    $scope.spotify_signOut = function () {
        SpotifyService.signOut(function (result) {
            SpotifyService.isSignedIn(function (result) {
                $scope.spotify.isSignedIn = result.data.signed_in;
            });
        });
    };
    $scope.items = [
        'The first choice!',
        'And another choice for you.',
        'but wait! A third!'
    ];
    $scope.status = {
        isopen: false
    };

    $scope.toggled = function(open) {
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
    /*-----Soundcloud----*/
}]);