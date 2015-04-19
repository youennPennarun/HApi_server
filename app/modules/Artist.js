/*global console*/
/*global module*/
/*global require*/
var ArtistModel = require('./mongoose/mongoose-models.js')().Artist,
    Spotify = require('./Spotify/Spotify.js'),
    SpotifyAuth = require('./Spotify/SpotifyAuth.js'),
    Q = require("q");


var Artist = function () {'use strict'; };

Artist.refresh = function (user, callback) {
    'use strict';
    var exist = false,
        list = [],
        final = [],
        i = 0;
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            Artist.get(user, function (err, existing) {
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    Spotify.getMyArtists(function (err, artists) {
                        if (err) {
                            console.log(err);
                            callback(err);
                        } else {
                            artists.forEach(function (artist) {
                                exist = false;
                                existing.forEach(function (e) {
                                    if (artist.name === e.name) {
                                        exist = true;
                                    }
                                });
                                if (!exist) {
                                    list.push({name: artist.name, spotifyId: artist.id});
                                }
                            });
                            if (list.length === 0) {
                                callback(null, {});
                            } else {
                                list.forEach(function (artist) {
                                    i += 1;
                                    Artist.insert(user, artist, function (err, saved) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            final.push(saved);
                                        }
                                        i -= 1;
                                        if (i === 0) {
                                            callback(null, final);
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
            });
        } else {
            console.log("not set...");
            callback("token expired");
        }
    });
};

Artist.get = function (user, callback) {
    var deferred = Q.defer(),
        artistDB = new ArtistModel();
    artistDB.find({}, function (err, list) {
        callback(err, list);
        if(!err) {
            deferred.resolve(list);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};
Artist.insert = function (user, artist, callback) {
    'use strict';
    var alarmDB = new ArtistModel();
    alarmDB.userId = user._id;
    alarmDB.name = artist.name;
    alarmDB.spotifyId = artist.spotifyId;
    alarmDB.musicgraphId = null;
    alarmDB.useItAsAlarm = true;
    alarmDB.save(function (err, saved) {
        callback(err, saved);
    });
};
Artist.get = function (user, callback) {
    'use strict';
    ArtistModel.find({userId: user._id}, function (err, artists) {
        callback(err, artists);
    });
};


module.exports = Artist;