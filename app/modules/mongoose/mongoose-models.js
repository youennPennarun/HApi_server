/*global module*/
/*global require*/
module.exports = function () {
    "use strict";
    var mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        models = {
            Alarm : mongoose.model('Alarm'),
            GToken : mongoose.model('GToken'),
            SoundcloudToken : mongoose.model('SoundcloudToken'),
            SpotifyToken : mongoose.model('SpotifyToken'),
            User : mongoose.model('User'),
            Artist : mongoose.model('Artist'),
            Playlist : mongoose.model('Playlist')
        };
    return models;
};