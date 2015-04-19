var Album = function (name, album_type, images, spotifyData) {
    'use strict';
    this.name = name;
    this.album_type = album_type;
    if(images) {
        this.images = images;
    } else {
        this.images = [];
    }
    this.spotifyData = {id: spotifyData.id, uri: spotifyData.uri};
};

module.exports = Album;
