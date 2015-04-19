/*global module*/
/*global require*/
/*global console*/
/*global console*/
/*jshint loopfunc:true*/
var MusicGraph = require('../modules/MusicGraph.js'),
    Artist = require('../modules/Artist.js'),
    Spotify = require('../modules/Spotify/Spotify.js'),
    SpotifyAuth = require('../modules/Spotify/SpotifyAuth.js'),
    Track = require('../modules/models/track/Track.js'),
    winston = require('winston'),
    models = require('../modules/mongoose/mongoose-models.js')(),
    PlaylistModel = models.Playlist,
    Playlist = require('../modules/Playlist.js'),
    Q = require("q");
module.exports = function (io, socket) {
    'use strict';

    socket.on("music:playlist:add", function (data) {
        console.log("music:playlist:add");
        if(data && data.type) {
            if (data.type == "track" && data.track && data.track.id) {
                console.log("adding track");
                Track.getTrack(data.track.id).then(function (track) {
                    Raspberry.playlist.push(track);
                    io.sockets.emit('music:playlist:add', {"type": "track", "track": track});
                }, function (err) {

                });
            } else if(data.type == "trackset" && data.tracks) {
                var promises = []
                for (var i = 0; i < data.tracks.length; i ++) {
                    if(data.tracks[i].id) {
                        promises.push(Track.getTrack(data.tracks[i].id));
                    }
                }
                Q.all(promises).then(function(tracks) {
                    for( var i = 0; i < tracks.length; i++) {
                        Raspberry.playlist.push(tracks[i]);
                    }
                    io.sockets.emit('music:playlist:add', {"type": "trackset", "tracks": tracks});
                }, function(err) {
                    //TODO
                    console.log(err);
                });
            } else if (data.type == "playlist" && data.playlist.id) {
                Track.getPlaylistTracks(data.playlist.id).then(function(tracks) {
                    for( var i = 0; i < tracks.length; i++) {
                        Raspberry.playlist.push(tracks[i]);
                    }
                    io.sockets.emit('music:playlist:add', {"type": "trackset", "tracks": tracks});
                }, function (err) {
                    //TODO
                });
            }
        }
    });
    socket.on("music:playlist:get", function (data, callback) {
        var response;
        PlaylistModel.findOne({}, function (err, playlist) {
            if (!err) {
                if (playlist) {
                    response = {
                        "status": "success",
                        "type": "trackset",
                        "playlist": playlist.tracks,
                        "idPlaying": playlist.idPlaying
                    };
                } else {
                    response = {
                        "status": "success",
                        "type": "trackset",
                        "playlist": [],
                        "idPlaying": -1
                    };
                }
            } else {
                response = {"status": "error", "error": err};
                winston.warn("music:playlist:get", response);
            }
            if (callback) {
                callback(response);
            } else {
                socket.emit("music:playlist:get", response);
            }
        });

    });
    socket.on("music:playlist:playing:setId", function (data) {
        PlaylistModel.findOne({}, function (err, playlist) {
            if (!err && playlist) {
                if (data.idPlaying < -1 ) {
                    data.idPlaying = -1;
                }else if(data.idPlaying > playlist.tracks.length) {
                    if(playlist.tracks.length == 0) {
                        data.idPlaying = -1
                    } else {
                        data.idPlaying = playlist.tracks.length-1;
                    }
                }
                playlist.idPlaying = data.idPlaying;
                playlist.save();
                socket.broadcast.emit('music:playlist:playing:id', data);
            }
        })

    });
    socket.on("music:playlist:set", function (data) {
        var newTracks = [];
        if(data && data.type) {
            if (data.type == "track" && data.track && data.track.id) {
                Track.getTrack(data.track.id).then(function (track) {
                    Raspberry.playlist = [];
                    Raspberry.playlist.push(track);
                    Raspberry.idPlaying = 0;
                    io.sockets.emit('music:playlist:set', {"type": "track", "track": track});
                }, function (err) {

                });
            } else if(data.type == "trackset" && data.tracks) {
                var promises = [];
                for (var i = 0; i < data.tracks.length; i ++) {
                    if(data.tracks[i].id) {
                        promises.push(Track.getTrack(data.tracks[i].id));
                    }
                }
                Q.all(promises).then(function(tracks) {
                    Raspberry.playlist = [];
                    for( var i = 0; i < tracks.length; i++) {
                        Raspberry.playlist.push(tracks[i]);
                    }
                    Raspberry.idPlaying = 0;
                    io.sockets.emit('music:playlist:set', {"type": "trackset", "tracks": tracks});
                }, function(err) {
                    //TODO
                    console.log(err);
                });
            } else if (data.type == "playlist" && data.playlist.id) {
                Track.getPlaylistTracks(data.playlist.id).then(function(tracks) {
                    Playlist.setPlaylist(tracks).then(function (data) {
                        console.log("--->theb");
                        console.log(data)
                        io.sockets.emit('music:playlist:set', {"type": "trackset", "tracks": data});
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    //TODO
                });
            }
        }
    });
};
