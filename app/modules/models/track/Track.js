var Q = require("q"),
    Spotify = require('../../Spotify/Spotify.js'),
    SpotifyAuth = require('../../Spotify/SpotifyAuth.js'),
    Album = require('../album/Album.js'),
    SpotifyAlbum = require('../album/SpotifyAlbum.js'),
    SpotifyArtist = require('../artist/SpotifyArtist.js'),
    Artist = require('../artist/Artist.js'),
    SpotifyTrack = require('./SpotifyTrack.js');

var Track = function (name, duration_ms, artists, album, spotifyData) {
    'use strict';
    this.name = name;
    this.duration_ms = duration_ms;
    this.artists = artists;
    this.album = {name: album.name, album_type: album.album_type, images: album.images, spotifyData: album.spotifyData};
    this.spotifyData = {id: spotifyData.id, uri: spotifyData.uri};
};
Track.getTrack = function (id, source) {
    "use strict";
    var deferred = Q.defer();
    if(!source) {
        source = "spotify";
    }
    Spotify.SpotifyApi.getTrack(id)
        .then(function(data) {
            deferred.resolve(Track.fromSpotify(data));
        }, function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
};
Track.getPlaylistTracks = function (playListId) {
    var deferred = Q.defer();
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            Spotify.getMe(function (err, me) {
                if (!err) {
                    Spotify.SpotifyApi.getPlaylistTracks(Spotify.me.id, playListId, {
                        'offset': 0,
                        'limit': 50,
                        'fields': 'items'
                    })
                        .then(
                        function (data) {
                            var tracks = []
                            if (data && data.items) {
                                for (var i = 0; i < data.items.length; i++) {
                                    if (data.items[i].track) {
                                        tracks.push(Track.fromSpotify(data.items[i].track));
                                    }
                                }
                                deferred.resolve(tracks);
                            }
                        }, function (err) {
                            deferred.reject(err);
                        });
                }
            });
        } else {
            deferred.reject("SpotifyAuth not set");
        }
    });
    return deferred.promise;

}

Track.fromSpotify = function(data) {
    "use strict";
    var album = new Album(data.album.name, data.album.album_type, data.album.images, new SpotifyAlbum(data.album.id, data.album.uri));
    var artists = [];
    for(var i = 0; i < data.artists.length; i ++) {
        artists.push(new Artist(data.artists[i].name, new SpotifyArtist(data.artists[i].id, data.artists[i].uri)));
    }
    var track = new Track(data.name, data.duration_ms, artists, album, new SpotifyTrack(data.id, data.uri));
    return track;
};
module.exports = Track;
