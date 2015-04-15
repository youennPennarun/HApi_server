var Album = function (name, type, images, spotifyData) {
    'use strict';
    this.name = name;
    this.type = type;
    if(images) {
        this.images = images;
    } else {
        this.images = [];
    }
    this.spotifyData = spotifyData;
};

module.exports = Album;