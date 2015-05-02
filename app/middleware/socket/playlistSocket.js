/*global module*/
/*global require*/
/*global console*/
/*global console*/
/*jshint loopfunc:true*/
var app = require("./../../../app.js"),
    modules = require("./../../modules"),
    MusicGraph = modules.music.musicGraph,
    Artist = modules.models.artist,
    Track = modules.models.track,
    Playlist = modules.music.playlist,
    Spotify = modules.spotify.spotify,
    winston = require('winston'),
    models = modules.mongoose.models(),
    PlaylistModel = models.Playlist,
    gcm = app.middleware.gcm,
    Q = require("q");
module.exports = function (io, socket) {
    'use strict';
    console.log(app.middleware);

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
                console.log(gcm);
		        gcm.broadcast({'music:playlist:playing:id':data.idPlaying});
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
/*                
		Track.getPlaylistTracks(data.playlist.id).then(function(tracks) {
                    Playlist.setPlaylist(tracks).then(function (data) {
                        console.log("--->theb");
			            GCM.broadcast({"music:playlist:set": ""});
                        io.sockets.emit('music:playlist:set', {"type": "trackset", "tracks": data});
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    //TODO
                });
*/
            }
        }
    });
};
