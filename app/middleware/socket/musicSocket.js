/*global module*/
/*global require*/
/*global console*/
/*global console*/
/*jshint loopfunc:true*/
var modules = require("../../modules"),
    MusicGraph = modules.music.musicGraph,
    Track = modules.models.track,
    Spotify = modules.spotify.spotify,
    SpotifyAuth = modules.spotify.spotifyAuth,
    winston = require('winston'),
    models = modules.mongoose.models,
    Playlist = models.Playlist,
    Q = require("q");
module.exports = function (io, socket) {
    'use strict';

    socket.on("music:player:next", function () {
        Playlist.findOne({}, function (err, playlist) {
           if(!err) {
               if (playlist && playlist.tracks.length > playlist.idPlaying) {
                   playlist.idPlaying ++;
                   playlist.save(function (err) {
                       if (!err) {
                           io.sockets.emit('music:player:next', {"idPlaying": playlist.idPlaying});
                       }
                   });
               } else {
                   console.log("playlist : "+playlist);
               }
           } else {
               console.log("ERROR:"+err);
           }
        });
    });
    socket.on("music:player:previous", function () {
        Playlist.findOne({}, function (err, playlist) {
            if(!err) {
                if (playlist && playlist.idPlaying > 0) {
                    playlist.idPlaying --;
                    playlist.save(function (err) {
                        if (!err) {
                            io.sockets.emit('music:player:previous', {"idPlaying": playlist.idPlaying});
                        }
                    });
                }
            }
        });
    });
    socket.on('music:playing', function (data) {
        if(data && data.track && data.query && data.query.get) {
            if (data.query.get.indexOf("cover") !== -1 && !data.track.cover) {
                data.track.cover = "";
            }
        }
        socket.broadcast.emit('music:playing', data);
    });
    socket.on("music:track:get", function (request, callback) {
        if (request && request.source && request.id) {
            if (request.source === "spotify") {
                Spotify.SpotifyApi.getTrack(request.id)
                    .then(function(data) {
                        var response = {"status": "success", "track": data};
                        if (!callback) {
                            socket.emit("music:track", response);
                        } else {
                            callback(response);
                        }
                    }, function(err) {
                        var response = {"status": "error", "error": err};
                        if (!callback) {
                            socket.emit("music:track", response);
                        } else {
                            callback(response);
                        }
                    });
            }
        }
    });

    socket.on("music:artist:get", function (data, callback) {
        if(data && data.artist) {
            if (!data.source) {
                data.source = "spotify";
            }
            if(data.artist.id) {
                if (data.source === "spotify") {
                    Spotify.getArtist(data.artist.id, function (err, result) {
                        var response;
                        if (!err) {
                            response = {status: "success", query: data.query, result: result};
                        } else {
                            response = {status: "error", query: data.query, err: err};
                        }
                        if (!callback) {
                            socket.emit("music:artist:get:response", response);
                        } else {
                            callback(response);
                        }
                    });
                }
            } else {
                console.log("missing data.artist.id");
            }
        } else {
            console.log("missing data or data.artist");
        }

    });
    socket.on("music:playlists:get", function (data, callback) {
        var response = {};
        if (!data) {
            data = {};
        }
        SpotifyAuth.isSet(function (isSet) {
            if (isSet) {
                console.log("GET PLAYLIST");
                Spotify.getPlaylists(function (err, data) {
                    if (!err) {
                        console.log("success");
                        response.status = "success";
                        response.playlists = data;
                    } else {
                        console.log("error: "+err);
                        response.status = "error";
                        response.error = err;
                    }
                    if (!callback) {
                        socket.emit("music:playlists", response);
                    } else {
                        callback(response);
                    }
                });
            }
        });
    });
    socket.on("music:playlist:tracks:get", function (data, callback) {
        if(data && data.id) {
            if(data.source === "spotify") {
                Spotify.SpotifyApi.getPlaylistTracks(Spotify.me.id, data.id, { 'offset' : 0, 'limit' : 50, 'fields' : 'items' }).then(
                    function (data) {
                        var response = {"status": "success", "tracks": data};
                        if(!callback) {
                            socket.emit("music:playlist:tracks", response);
                        } else {
                            callback(response);
                        }
                    },
                    function (err) {
                        var response = {"status": "error", "error": err};
                        if(!callback) {
                            socket.emit("music:playlist:tracks", response);
                        } else {
                            callback(response);
                        }
                    }
                );
            }
        }

    });
};
