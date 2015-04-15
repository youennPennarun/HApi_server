/*jslint browser: true*/
/*global angular*/
/*global $*/
/*global console*/
var haPi = angular.module("haPi", ['ui.router', 'ui.bootstrap', 'chart.js', 'ngPrettyJson']);

haPi.config(function ($stateProvider, $urlRouterProvider) {
    "use strict";
    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('Home', {
        url: '/home',
        templateUrl: 'views/home.html',
        data: {
            authenticate: true
        }
    }).state('Alarms', {
        url: '/alarm',
        templateUrl: 'views/alarms.html',
        controller: "AlarmController",
        data: {
            authenticate: true
        }
    }).state('AlarmSettings', {
        url: '/alarm/settings',
        templateUrl: 'views/alarm-settings.html',
        controller: "AlarmSettingsController",
        data: {
            authenticate: true
        }
    }).state('Calendar', {
        url: '/modules/calendar',
        templateUrl: 'views/modules/GCalendar.html',
        controller: "GCalendarController"
    }).state('Echonest', {
        url: '/modules/echonest',
        templateUrl: 'views/modules/echonest.html',
        controller: "EchonestController",
        data: {
            authenticate: true
        }
    }).state('Settings', {
        url: '/settings',
        templateUrl: 'views/settings.html',
        controller: "SettingsController",
        data: {
            authenticate: true
        }
    }).state('Logs', {
        url: '/settings/logs',
        templateUrl: 'views/logs.html',
        controller: "LogController",
        data: {
            authenticate: true
        }
    }).state('Music', {
        url: '/music',
        templateUrl: 'views/music.html',
        controller: "MusicController",
        data: {
            authenticate: true
        }
    }).state('Artist', {
        url: '/music/:source/artist/:id',
        templateUrl: 'views/music/artist.html',
        controller: "ArtistController",
        data: {
            authenticate: true
        }
    }).state('User', {
        url: '/user',
        templateUrl: 'views/user.html',
        controller: "UserController",
        data: {
            authenticate: true
        }
    }).state('Login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: "UserController"
    });

}).config(function ($sceDelegateProvider) {
    'use strict';
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://embed.spotify.com/*',
        'https://embed.spotify.com/**'
    ]);
}).run(function ($rootScope, $state, UserService) {
    'use strict';
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (toState.data && toState.data.authenticate) {
            UserService.isAuthorized(function (authorized) {
                if (!authorized) {
                    $state.transitionTo("Login");
                    event.preventDefault();
                }
            });
        }
    });
});