/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global console*/
/*global $*/
haPi.service("MusicPlayerService", [ "$http", "$rootScope", "socket", "RequestService", function ($http, $rootScope, socket, RequestService) {
    'use strict';
    this.volume = 80;
    this.playing = null;
    this.play = function (track) {
        if (track.uri) {
            socket.emit('pi:sound:play', {type: "track", track: {uri: track.uri}});
        } else if (track.list) {
            socket.emit('pi:sound:play', {type: "trackset", track: track.list});
        }
    };

    this.resume = function () {
        socket.emit('pi:sound:resume', {});
    };
    this.pause = function () {
        socket.emit('pi:sound:pause', {});
    };
    this.next = function () {
        socket.emit('pi:sound:next', {});
    };
    this.previous = function () {
        socket.emit('pi:sound:previous', {});
    };
    this.discover = function () {
        socket.emit('music:discovering', {});
    };
    this.getPlaying = function () {
        socket.emit('music:playing:get', {});
    };

    this.searchAndPlay = function (artistName) {
        if (artistName && artistName !== "") {
            socket.emit('pi:sound:search_and_play', {"search": {"artist": artistName}});
        }
    };
    this.setVolume = function () {
        socket.emit('pi:sound:volume:set', {volume: this.volume});
    };

    var self = this;
    $rootScope.$on("socket:connected", function () {
        socket.on('pi:notify:sound:volume', function (data) {
            self.volume = data.volume;
        });
        socket.on("music:playing", function (data) {
            self.playing = data.track;
        });
        socket.emit('pi:sound:volume:get');
        socket.emit('music:playing:get');
    })

}]);