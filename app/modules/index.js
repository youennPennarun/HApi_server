exports.google = {};
exports.google.googleAuth = require("./Google/GoogleAuth.js");
exports.google.googleError = require("./Google/GoogleError.js");
exports.google.googlePlus = require("./Google/GooglePlus.js");

exports.spotify = {};
exports.spotify.spotify = require("./Spotify/Spotify");
exports.spotify.spotifyAuth = require("./Spotify/SpotifyAuth");

exports.music = {};
exports.music.playlist = require("./music/Playlist.js");
exports.music.track = require("./models/track/Track.js");
exports.music.musicGraph  =require("./MusicGraph");

exports.raspberry = require("./Raspberry.js");

exports.mongoose = require("./mongoose");

exports.models = require("./models")


