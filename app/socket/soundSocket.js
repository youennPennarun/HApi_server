/*global module*/
/*global require*/
/*global console*/
var Raspberry = require('../modules/raspberry/Raspberry.js'),
    Spotify = require("../modules/Spotify/Spotify.js")
module.exports = function (io, socket) {
    'use strict';
    socket.on('pi:sound:play', function (data){
        var trackData,
            i = 0;
        if(data.type === "track" && data.track) {
            trackData = {'type': 'track', 'track': {'link': data.track, 'source': 'spotify'}};
            if(trackData) {
                emitToPi('sound:play', trackData);
            }
        } else if(data.type === "trackset" && data.tracks) {
            trackData = {'type': 'trackset', 'tracks': []};
            for(i = 0; i < data.tracks.length; i ++) {
                if(data.tracks[i].uri) {
                    trackData.tracks.push({'link': {'uri': data.tracks[i].uri, 'source': 'spotify'}});
                }
            }
            if(trackData) {
                emitToPi('sound:play', trackData);
            }
        }else if (data.type === "playlist" && data.playlist && data.playlist.id) {
            Spotify.getMe(function () {
                Spotify.SpotifyApi.getPlaylistTracks(Spotify.me.id, data.playlist.id, { 'offset' : 0, 'limit' : 50, 'fields' : 'items' }).then(
                    function (data) {
                        trackData = {'type': 'trackset', 'tracks': []};
                        data.items.forEach(function (item) {
                            if(item.track && item.track.uri) {
                                trackData.tracks.push({'link': {'uri': item.track.uri, 'source': 'spotify'}});
                            }
                        });
                        if(trackData) {
                            emitToPi('sound:play', trackData);
                        }
                    },
                    function (err) {
                        // TODO
                        console.log(err);
                    }
                );
            });
        }
    });
    socket.on('pi:sound:resume', function (){
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit('sound:resume');
        }
    });
    socket.on('pi:sound:pause', function (data){
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit('sound:pause', {});
        }
    });
    socket.on('pi:sound:volume:get', function (){
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit('sound:volume:get');
        }
    });
    socket.on('pi:sound:next', function (){
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit('sound:next');
        }
    });
    socket.on('pi:sound:previous', function (){
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit('sound:previous');
        }
    });
    socket.on('pi:sound:volume:set', function (data){
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit('sound:volume:set', data);
        }
    });
    socket.on('pi:notify:sound:volume', function (data){
        socket.broadcast.emit('pi:notify:sound:volume', data);
    });
    socket.on('pi:player:status', function (data){
        socket.broadcast.emit('pi:player:status', data);
    });
    function emitToPi(msg, data) {
        if (Raspberry.socket) {
            io.sockets.connected[Raspberry.socket.id].emit(msg, data);
        }
    }
};
