
/*global require*/
/*global console*/
/*global module*/
var SpotifyAuth = require('./SpotifyAuth.js'),
    config = require("../../assets/private/config.json"),
    SpotifyWebApi = require('spotify-web-api-node'),
    mongoose = require("mongoose"),
    models = require('../mongoose/mongoose-models.js')(),
    Q = require('q');
var Spotify = function () {"use strict"; };
Spotify.SpotifyApi = new SpotifyWebApi({
    clientId : config.spotify_config.client_id,
    clientSecret : config.spotify_config.client_secret,
    redirectUri : config.spotify_config.redirect_uri
});
Spotify.me = null;
Spotify.getMe = function (callback) {
    'use strict';
    if (Spotify.me === null) {
        Spotify.SpotifyApi.getMe().then(function (data) {
            Spotify.me = data;
            callback(null, Spotify.me);
        }, function (err) {
            callback(err);
        });
    } else {
        callback(null, Spotify.me);
    }
};
Spotify.getPlaylists = function (callback) {
    'use strict';
    Spotify.getMe(function(err, me) {
        if (!err) {
            var response = {};
            Spotify.SpotifyApi.getUserPlaylists(Spotify.me.id, {limit: 50, offset: 0}).then(
                function (data) {
                    response = data;
                    console.log(data.total);
                    var nbPromise = data.total - 50,
                        promises = [];
                    for (var i = 50; i < nbPromise+50; i+=50) {
                        console.log("new playlist promise offset:"+i);
                        promises.push(Spotify.SpotifyApi.getUserPlaylists(Spotify.me.id, {limit: 50, offset: i}));
                    }
                    Q.all(promises).then(function (results) {
                        for (var i = 0; i < results.length; i++) {
                            response.items = response.items.concat(results[i].items);
                        }
                        console.log("finally : nb items="+response.items.length);
                        callback(null, response);
                    }, console.error);
                },
                function (err) {
                    console.log(err);
                    callback(err);
                }
            );
        } else {
            callback(err);
        }
    });
};
Spotify.getMyArtists = function (callback) {
    'use strict';
    var artists = [],
        counter = 0,
        exists = false;
    Spotify.getPlaylists(function (err, data) {
        if (err) {
            callback(err);
            console.log(err);
        } else {
            data.items.forEach(function (item) {
                counter += 1;
                Spotify.SpotifyApi.getPlaylistTracks(Spotify.me.id, item.id, { 'offset' : 0, 'limit' : 50, 'fields' : 'items' }).then(
                    function (data) {
                        data.items.forEach(function (item) {
                            exists = false;
                            artists.forEach(function (a) {
                                if (a.name === item.track.artists[0].name) {
                                    exists = true;
                                }
                            });
                            if (!exists) {
                                artists.push(item.track.artists[0]);
                            }
                        });
                        counter -= 1;
                        if (counter === 0) {
                            callback(null, artists);
                        }

                    },
                    function (err) {
                        counter -= 1;
                        console.log('Something went wrong!', err);
                        console.log(item);
                        if (counter === 0) {
                            callback(null, artists);
                        }
                    }
                );
            });
        }
    });
};
Spotify.getMySavedTracks = function (callback) {
    'use strict';
    Spotify.SpotifyApi.getMySavedTracks({limit: 50, offset: 0}).then(
        function (data) {
            callback(null, data);
        },
        function (err) {
            console.log("err");
            console.log(err);
            callback(err);
        }
    );
};
Spotify.searchTrack = function (trackData) {
    'use strict';
    var searchStr = "",
        i = 0,
        key;
    for (key in trackData) {
        if (i) {
            searchStr += " ";
        }
        searchStr += key + ":" + trackData[key];
        i += 1;
    }
    return Spotify.SpotifyApi.searchTracks(searchStr)

};

Spotify.searchArtist = function (artist, callback) {
    'use strict';
    Spotify.SpotifyApi.refreshAccessToken();
    Spotify.SpotifyApi.searchArtists(artist).then(
        function (data) {
            callback(null, data);
        },
        function (err) {
            console.log("err");
            console.log(err);
            callback(err);
        }
    );
};
Spotify.getArtist = function (artist_id, callback) {
    'use strict';
    Spotify.SpotifyApi.refreshAccessToken();
    var waiting = 3,
        artist = {};
    Spotify.SpotifyApi.getArtist(artist_id).then(
        function (data) {
            artist.data = data;
            waiting -= 1;
            if (!waiting) {
                callback(null, artist);
            }
        },
        function (err) {
            callback(err);
        }
    );
    Spotify.SpotifyApi.getArtistAlbums(artist_id).then(
        function (data) {
            return data.items.map(function (a) { return a.id; });
        }
    ).then(
        function (albums) {
            return Spotify.SpotifyApi.getAlbums(albums);
        }
    ).then(
        function (data) {
            artist.albums = data.albums;
            waiting -= 1;
            if (!waiting) {
                callback(null, artist);
            }
        }
    ).catch(
        function (error) {
            console.error(error);
        }
    );
    Spotify.SpotifyApi.getArtistTopTracks(artist_id, 'GB').then(
        function (data) {
            artist.top_tracks = data.tracks;
            waiting -= 1;
            if (!waiting) {
                callback(null, artist);
            }
        },
        function (err) {
            console.log('Something went wrong!', err);
        }
    );

};

module.exports = Spotify;

