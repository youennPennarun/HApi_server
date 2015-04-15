/*global require*/
/*global exports*/
var assert = require('assert'),
    MusicGraph = require('../app/modules/MusicGraph.js');

exports.searchArtist_unknown = function (test) {
    'use strict';
    var artistName = "ffregfe";
    MusicGraph.searchArtist({name: artistName}, function (err, data) {
        assert.equal(data.status.code, 0);
        assert.equal(data.pagination.count, 0);
        test.done();
    });
};
exports.searchArtist_known = function (test) {
    'use strict';
    var artistName = "supertramp";
    MusicGraph.searchArtist({name: artistName}, function (err, data) {
        assert.equal(data.status.code, 0);
        assert.notEqual(data.pagination.count, 0);
        test.done();
    });
};
exports.generateArtistPlaylist = function (test) {
    'use strict';
    var artistId = "e72f6119-a6b5-11e0-b446-00251188dd67";
    MusicGraph.generateArtistPlaylist(artistId, {}, function (err, data) {
        assert.equal(data.status.code, 0);
        assert.notEqual(data.pagination.count, 0);
        test.done();
    });
};
exports.randomArtist = function (test) {
    'use strict';
    var artistList = ['chill bump', 'Alif Tree', "Damon Albarn", "Sola Rosa", "Pogo", "True Live", "Miss White & The Drunken Piano", "Fat Freddy's Drop", "Erik Sumo Band",  "[dunkelbunt]", "Savages Y Suefo", "Marko Markovic", "Kid Loco", "Alif Tree", "Noze", "WE ARE MATCH", "La Yegros", "Al'Tarba", "G. Bonson", "Le Cercle"];
    MusicGraph.randomArtist(artistList, function (data) {
        test.ok(data !== undefined, "data shouldn't be undefined");
        test.ok(data.musicgraphId !== undefined, "Music graph id not found");
        test.done();
    });
};

exports.playlistFromArtistNames = function (test) {
    'use strict';
    var artistList = ['chill bump', 'Alif Tree', "Damon Albarn", "Sola Rosa", "Pogo", "True Live", "Miss White & The Drunken Piano", "Fat Freddy's Drop", "Erik Sumo Band",  "[dunkelbunt]", "Savages Y Suefo", "Marko Markovic", "Kid Loco", "Alif Tree", "Noze", "WE ARE MATCH", "La Yegros", "Al'Tarba", "G. Bonson", "Le Cercle"];
    MusicGraph.playlistFromArtistNames(artistList, {number: 1}, function (err, data) {
        //console.log(data);
        console.log("----ERRORS----");
        console.log(err);
        console.log("----DATA----");
        console.log(data);
        test.ok((data !== undefined || err !== undefined), "data shouldn't be undefined");
        test.done();
    });
};
