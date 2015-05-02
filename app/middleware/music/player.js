var modules = require("./../../modules"),
    Track = modules.music.track,
    Playlist = modules.music.playlist,
    MusicGraph = modules.music.musicGraph,
    SpotifyAuth = modules.spotify.spotifyAuth,
    Artist = modules.mongoose.models().Artist;

var init = function(app) {
    "use strict";
    var Player = function () {
    };
    Player.setPlaylist = function (data) {
        if (data.type === "playlist" && data.playlist.id) {
            Track.getPlaylistTracks(data.playlist.id).then(function (tracks) {
                console.log("got " + tracks.length + " tracks");
                Playlist.setPlaylist(tracks).then(function (data) {
                    app.middleware.gcm.broadcast({"music:playlist:set": ""});
                    app.middleware.io.sockets.emit('music:playlist:set', {"type": "trackset", "tracks": data});
                }, function (err) {
                    console.log(err);
                });
            }, function (err) {
                console.log(err);
                //TODO hello
            });
        }
    };
    Player.discover = function (data) {
        if (!data) {
            data = {};
        }
        if (!data.nbSongs) {
            data.nbSongs = 3;
        }
        SpotifyAuth.isSet(function (isSet) {
            Artist.find({}, function (err, artists) {
                if (!err) {
                    if (artists && artists.length !== 0) {
                        if (!data) {
                            data = {number: 3};
                        }
                        if (!data.number) {
                            data.number = 3;
                        }
                        MusicGraph.playlistFromArtistNames(artists, {'return_type': 'spotify_url'}, function (err, data) {
                            if (err) {
                                console.log(err);
                                // TODO
                            } else {
                                console.log("got playlist");
                                //console.log(data);
                                var tracks = [];
                                for (var i = 0; i < data.length; i++) {
                                    tracks.push(Track.fromSpotify(data[i].link));
                                }

                                Playlist.setPlaylist(tracks).then(function (data) {
                                    console.log(data);
                                    app.middleware.gcm.broadcast({"music:playlist:set": ""});
                                    app.middleware.io.sockets.emit('music:playlist:set', {"type": "trackset", "tracks": data});
                                }, function (err) {
                                    console.log(err);
                                });

                            }
                        });
                    } else {
                        console.log("music:discovering", {status: "error", code: 2, error: "artist list not set"});
                        // TODO
                    }
                } else {
                    console.log(err);
                    // TODO
                }
            });
        });
    };


    app.middleware.player = Player;
};
module.exports = {
    init: init
};
