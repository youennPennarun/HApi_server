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
                   })
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
                    })
                }
            }
        });
    });
    socket.on('music:playing', function (data) {
        if(data && data.track && data.query && data.query.get) {
            if (data.query.get.indexOf("cover") != -1 && !data.track.cover) {
                data.track.cover = "";
            }
        }
        socket.broadcast.emit('music:playing', data);
    });
    socket.on("music:track:get", function (request, callback) {
        if (request && request.source && request.id) {
            if (request.source == "spotify") {
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
    socket.on('music:discovering', function (data) {
        winston.info("discovering");
        var result = [],
            i = 0,
            requests = 0,
            fail = false,
            search = [];
        if (Raspberry.socket) {
            SpotifyAuth.isSet(function (isSet) {
                Artist.get(socket.decoded_token).then(function(artists) {
                    if (artists && artists.length !== 0) {
                        if (!data) {
                            data = {number: 3};
                        }
                        if (!data.number) {
                            data.number = 3;
                        }
                        MusicGraph.playlistFromArtistNames(artists, {'return_type': 'spotify_url'}, function (err, data) {
                            var i = 0,
                                requests = 0,
                                searchSuccess = true,
                                playlist = [];
                            if (err) {
                                socket.emit('sound:play', {error: err});
                            } else {
                                io.sockets.connected[Raspberry.socket.id].emit('sound:play', {type: "trackset", tracks: data});
                            }
                        });
                    } else {
                        socket.emit("music:discovering", {status: "error", code : 2, error: "artist list not set"});
                    }
                }, function (err) {
                    socket.emit("music:discovering", {status: "error", error: err});
                });
            });
        } else {
            winston.warn("pi not set");
            socket.emit("music:discovering", {status: "error", code : 1, error: "pi not set"});
        }
    });
    socket.on("music:search", function(data, callback) {
        if(data && data.query) {
            if (!data.source) {
                data.source = "spotify";
            }
            if (data.source === "spotify") {
                SpotifyAuth.isSet(function (isSet) {
                    if (isSet) {
                        if (data.query.artist) {
                            Spotify.searchArtist(data.query.artist, function (err, result) {
                                if(!err) {
                                    var response = {status: "success", query: data.query, result: result};
                                    if (!callback) {
                                        socket.emit("music:search:result", response);
                                    } else {
                                        callback(response);
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    }
                });
            }
        }playlise

    });
    socket.on("music:artist:get", function (data, callback) {
        if(data && data.artist) {
            if (!data.source) {
                data.source = "spotify";
            }
            if(data.artist.id) {
                if (data.source == "spotify") {
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
            if(data.source == "spotify") {
                Spotify.SpotifyApi.getPlaylistTracks(Spotify.me.id, data.id, { 'offset' : 0, 'limit' : 50, 'fields' : 'items' }).then(
                    function (data) {
                        var response = {"status": "success", "tracks": data}
                        if(!callback) {
                            socket.emit("music:playlist:tracks", response);
                        } else {
                            callback(response);
                        }
                    },
                    function (err) {
                        var response = {"status": "error", "error": err}
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
