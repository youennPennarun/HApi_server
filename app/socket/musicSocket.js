/*global module*/
/*global require*/
/*global console*/
/*global console*/
/*jshint loopfunc:true*/
var MusicGraph = require('../modules/MusicGraph.js'),
    Artist = require('../modules/Artist.js'),
    Spotify = require('../modules/Spotify/Spotify.js'),
    SpotifyAuth = require('../modules/Spotify/SpotifyAuth.js'),
    Raspberry = require('../modules/raspberry/Raspberry.js'),
    Album = require('../modules/models/album/Album.js'),
    SpotifyAlbum = require('../modules/models/album/SpotifyAlbum.js'),
    SpotifyArtist = require('../modules/models/artist/SpotifyArtist.js'),
    Artist = require('../modules/models/artist/Artist.js'),
    Track = require('../modules/models/track/Track.js'),
    SpotifyTrack = require('../modules/models/track/SpotifyTrack.js'),
    winston = require('winston'),
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
	if(!Raspberry.playlist) {
		Raspberry.playlist = [];
	}
	console.log(Raspberry);
	console.log("----------------------------------------");
	response = {"status": "success", "type": "trackset", "playlist": Raspberry.playlist, "idPlaying": Raspberry.idPlaying};
	console.log(response);
	if (callback) {
		callback(response);
	} else {
		socket.emit("music:playlist:get", response);
	}
    });
    socket.on("music:playlist:playing:setId", function (data) {
	if (data.idPlaying < -1 ) {
		data.idPlaying = -1;
	}else if(data.idPlaying > Raspberry.playlist.length) {
		if(Raspberry.playlist.length == 0) {
			data.idPlaying = -1
		} else {
			data.idPlaying = Raspberry.playlist.length-1;
		}
	}
	Raspberry.idPlaying = data.idPlaying
        socket.broadcast.emit('music:playlist:playing:id', data);
    });
    socket.on("music:playlist:set", function (data) {
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
                var promises = []
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
		    Raspberry.playlist = [];
		    for( var i = 0; i < tracks.length; i++) {
                    	Raspberry.playlist.push(tracks[i]);
		    }
		    Raspberry.idPlaying = 0;
                    io.sockets.emit('music:playlist:set', {"type": "trackset", "tracks": tracks});
                }, function (err) {
                    //TODO
                });
            }
        }
    });
    socket.on("music:player:next", function () {
	if(Raspberry.playlist && Raspberry.playlist.length > 0) {
	       if (Raspberry.idPlaying + 1 > Raspberry.playlist.length) {
	       } else {
		   Raspberry.idPlaying++;
	       }
		console.log("music:player:next -> Raspberry.idPlaying="+Raspberry.idPlaying);
		io.sockets.emit('music:player:next', {"idPlaying": Raspberry.idPlaying});
	}
    });
    socket.on("music:player:previous", function () {
	if(Raspberry.playlist && Raspberry.playlist.length > 0) {
		if (Raspberry.idPlaying - 1 < 0) {
		    Raspberry.idPlaying = Raspberry.playlist.length - 1;
		} else {
		    Raspberry.idPlaying--;
		}
		console.log("music:player:previous -> Raspberry.idPlaying="+Raspberry.idPlaying);
		io.sockets.emit('music:player:previous', {"idPlaying": Raspberry.idPlaying});
	}
    });
    socket.on('music:playing:get', function () {
        if (Raspberry.socket) { io.sockets.connected[Raspberry.socket.id].emit('sound:playing:get');
        }
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
                Artist.get(socket.decoded_token, function (err, artists) {
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
        }

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
                Spotify.getPlaylists(function (err, data) {
                    if (!err) {
                        response.status = "success";
                        response.playlists = data;
                    } else {
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
