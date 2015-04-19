/*global require*/
/*global module*/
/*global console*/
/*jshint -W083 */
/*loopfunc: true*/
var config = require('../assets/private/config.json'),
    PlaylistModel = require('./mongoose/mongoose-models.js')().Playlist,
    Q = require("q");


var Playlist = function () {"use strict"; };
Playlist.add = function (playlistDoc, track) {
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
}
Playlist.getPlaylist = function () {
    var deferred = Q.defer();
    PlaylistModel.findOne({}, function (err, playlist) {
        console.log(err);
        deferred.resolve(playlist);
    });
    return deferred.promise;
}
Playlist.setPlaylist = function (data) {
    var deferred = Q.defer(),
        idTmp;
    console.log("-------saving-----");
    console.log(data);
    Playlist.getPlaylist().then(function (playlist) {
        PlaylistModel.update({_id: playlist._id}, {$set:{tracks: data, idPlaying: 0}}, function (err, saved) {
            if (!err) {
                console.log("éOKAY->"+saved);
                deferred.resolve(data);
            } else {
                deferred.reject(err);
            }
        });
    });
    return deferred.promise;
};

module.exports = Playlist;
