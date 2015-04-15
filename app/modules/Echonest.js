var config = require('../assets/private/config.json'),
    request = require('request'),
    qs = require('qs');

var Echonest = function () {};

Echonest.api_key = config.echonest_config.api_key;
Echonest.customer_key = config.echonest_config.customer_key;
Echonest.shared_secret = config.echonest_config.shared_secret;
Echonest.api_url = config.echonest_config.api_url;

function findAndRemove(array, property) {
    $.each(array, function(index, result) {
        //Remove from array
        array.splice(index, 1);
    });
}
Echonest.searchArtist = function (data, callback) {
    "use strict";
    var uri = Echonest.api_url + "artist/search";
    data.api_key = Echonest.api_key;
    uri += "?" + qs.stringify(data);
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        var json =  JSON.parse(body)
        callback(err, json);
    });
};
Echonest.searchSimilarArtist = function (data,callback) {
    "use strict";
    var uri = Echonest.api_url+"artist/similar";
    data.api_key = Echonest.api_key;
    data.format = "json";
    data.bucket=["id:spotify", "images", "genre"];
    uri += "?" + qs.stringify(data, { indices: false });
    console.log(uri)
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        callback(err, JSON.parse(body));
    });
};
Echonest.searchSong = function (data,callback) {
    "use strict";
    var uri = Echonest.api_url+"song/search";
    data.api_key = Echonest.api_key;
    data.format = "json";
    data.bucket=["id:spotify","tracks"];
    uri += "?" + qs.stringify(data, { indices: false });
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        callback(err, JSON.parse(body));
    });
};

Echonest.getArtistSong = function (data,callback) {
    "use strict";
    var uri = Echonest.api_url+"artist/songs";
    data.api_key = Echonest.api_key;
    data.format = "json";
    data.results = 100;
    data.start = 0;
    uri += "?" + qs.stringify(data, { indices: false });
    console.log(uri);
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        callback(err, JSON.parse(body));
    });
};
Echonest.getSimilarSong = function (data,callback) {
    "use strict";
    var uri = Echonest.api_url+"artist/similar";
    data.api_key = Echonest.api_key;
    data.format = "json";
    data.limit = false;
    data.bucket = ["songs","genre","id:spotify"];
    data.results = 100;
    uri += "?" + qs.stringify(data, { indices: false });
    console.log(uri);
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        callback(err, JSON.parse(body));
    });
};
Echonest.getSpotifyTrack = function (data, callback) {
    "use strict";
    var uri = Echonest.api_url+"song/search";
    data.api_key = Echonest.api_key;
    data.bucket=["id:spotify","tracks"];
    data.format = "json";
    data.results = 1;
    uri += "?" + qs.stringify(data, { indices: false });
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        callback(err, JSON.parse(body));
    });
}

/*--------------------------------------------------------*/
/*
MusicGraph.fluidTempo = function (currentId, total) {
    'use strict';
    var tempo = {},
        t1 = Math.round(total / 3),
        t2 = Math.round(total / 3 * 2),
        t3 = Math.round(total / 3 * 3);
    if (currentId < t1) {
        tempo = {id: 0, value: "slow"};
    } else if (currentId >= t1 && currentId < t2) {
        tempo = {id: 1, value: "moderate"};
    } else {
        tempo = {id: 2, value: "fast"};
    }
    return tempo;
};
Echonest.playlistFromArtistNames = function (artists, options, callback) {
    'use strict';
    var i = 0,
        requests = 0,
        playlist = [];
    if (!options) {
        options = {};
    }
    if (!options.number) {
        options.number = 3;
    }
    if (!options.tempo || options.tempo !== 'any' || options.tempo !== 'increasing' || options.tempo !== 'descending') {
        options.tempo = "any";
    }
    for (i = 0; i < options.number; i += 1) {
        (function getTrack(i) {
            requests += 1;
            var tempo = MusicGraph.fluidTempo(i, options.number),
                track = {},
                artistTmp = null,
                title,
                artist_name,
                random;
            MusicGraph.randomPlaylist(artists, {tempo: tempo.value}, function (err, data) {
                var valid = false;
                if (!err) {
                    if (data.length > 0) {
                        while (!valid) {
                            random = Math.floor((Math.random() * data.length));
                            title = data[random].title;
                            artist_name = data[random].artist_name;
                            valid = true;
                            playlist.forEach(function (track) {
                                if (track.title === title && track.artist_name === artist_name) {
                                    valid = false;
                                }
                            });
                        }
                        playlist.push({title: title, artist_name: artist_name, tempo: tempo});
                    } else {
                        valid = false;
                    }
                    if (!valid) {
                        getTrack(i);
                    } else {
                        requests -= 1;
                        if (!requests) {
                            callback(null, playlist);
                        }
                    }
                } else {
                    callback(err);
                }
            });
        })(i);
    }
};
*/
/*--------------------------------------------------------*/


module.exports = Echonest;