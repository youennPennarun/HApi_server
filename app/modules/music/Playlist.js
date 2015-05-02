/*global require*/
/*global module*/
/*global console*/
/*jshint -W083 */
/*loopfunc: true*/
var config = require('./../../assets/private/config.json'),
    PlaylistModel = require('./../mongoose/mongoose-models.js')().Playlist,
    Q = require("q");


var Playlist = function() {"use strict"; };
Playlist.add = function(playlistDoc, track) {
    "use strict";
    var deferred = Q.defer();
    playlistDoc.tracks.push(track);
    PlaylistModel.update({_id: playlistDoc._id}, playlistDoc, function (err, saved) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(saved);
        }
    });
    return deferred.promise;
};
Playlist.getPlaylist = function () {
    "use strict";
    var deferred = Q.defer();
    PlaylistModel.findOne({}, function (err, playlist) {
        if (!err) {
            deferred.resolve(playlist);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};
Playlist.setPlaylist = function (data) {
    "use strict";
    var deferred = Q.defer(),
        idTmp;
    Playlist.getPlaylist().then(function (playlist) {
        PlaylistModel.update({_id: playlist._id}, {$set:{tracks: data, idPlaying: 0}}, function (err, saved) {
            if (!err) {
                console.log("playlist successfully updated");
                deferred.resolve(data);
            } else {
                deferred.reject(err);
            }
        });
    });
    return deferred.promise;
};

module.exports = Playlist;
