var Artist = function (name, spotifyData) {
    'use strict';
    this.name = name;
    this.spotifyData = {id: spotifyData.id, uri: spotifyData.uri};
};

module.exports = Artist;
