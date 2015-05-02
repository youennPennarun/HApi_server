/*global require*/
/*global module*/
/*global console*/
/*jshint -W083 */
/*loopfunc: true*/
var config = require('../assets/private/config.json'),
    request = require('request'),
    qs = require('qs'),
    winston = require('winston'),
    Spotify = require('../modules/Spotify/Spotify.js'),
    Q = require("q");


var MusicGraph = function () {"use strict"; };

MusicGraph.api_key = config.musicgraph_config.api_key;
MusicGraph.api_url = config.musicgraph_config.api_url;


MusicGraph.searchArtist = function (data, callback) {
    "use strict";
    var uri = MusicGraph.api_url + "artist/search";
    data.api_key = MusicGraph.api_key;
    uri += "?" + qs.stringify(data);
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        MusicGraph.responseHandler(response, body, function (err, data) {
            callback(err, JSON.parse(body));
        });
    });
};
MusicGraph.playlist = function (data, callback) {
    "use strict";
    var uri = MusicGraph.api_url + "playlist",
        i = 0,
        artists = "";
    data.api_key = MusicGraph.api_key;
    if (typeof data.artist_ids !== 'string') {
        for (i = 0; i < data.artist_ids.length; i += 1) {
            artists += data.artist_ids[i];
            if (i !== data.artist_ids.length - 1) {
                artists += ",";
            }
        }
        data.artist_ids = artists;
    }
    uri += "?" + qs.stringify(data);
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        var json = null;
        try {
            json = JSON.parse(body);
        } catch (e) {
            err = e;
        }
        callback(err, json);
    });
};

MusicGraph.randomArtist = function (artistList, callback) {
    'use strict';
    var artist = {name: artistList[Math.floor((Math.random() * artistList.length))].name};
    console.log("looking for "+ artist.name);
    MusicGraph.searchArtist({name: artist.name}, function (err, artists) {
        if (!err) {
            if (artists.data[0]) {
                artist.musicgraphId = artists.data[0].id;
                callback(null, artist);
            } else {
                MusicGraph.randomArtist(artistList, callback);
            }
        } else {
            callback(err);
        }
    });
};

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
MusicGraph.compareByTempo = function (a, b) {
    'use strict';
    if (a.tempoId && b.tempoId) {
        if (a.tempoId < b.tempoId) {
            return -1;
        }
        if (a.tempoId > b.tempoId) {
            return 1;
        }
    }
    return 0;
};
MusicGraph.generateArtistPlaylist = function (artistId, options, callback) {
    'use strict';
    var uri = MusicGraph.api_url + "playlist",
        query = {
            api_key: MusicGraph.api_key,
            artist_ids: artistId
        };
    if (options.tempo) {
        query.tempo = options.tempo;
    }
    uri += "?" + qs.stringify(query);
    request({
        uri: uri,
        method: 'GET'
    }, function (err, response, body) {
        MusicGraph.responseHandler(response, body, function (err, data) {
            callback(err, data);
        });
    });
};
MusicGraph.generatePlaylist = function (similarToIds, callback) {
    'use strict';
    var i = 0,
        uri = MusicGraph.api_url + "playlist",
        left = 0,
        query = {},
        result = [],
        nb = 3,
        t1 = Math.round(nb / 3),
        t2 = Math.round(nb / 3 * 2),
        t3 = Math.round(nb / 3 * 3),
        tempoId = 0;
    query.api_key = MusicGraph.api_key;
    query.tempo = "any";
    query.artist_ids = "";
    for (i = 0; i < 3; i += 1) {
        left += 1;
        if (i < t1) {
            query.tempo = "slow";
            tempoId = 0;
        } else if (i >= t1 && i < t2) {
            query.tempo = "moderate";
            tempoId = 1;
        } else {
            query.tempo = "fast";
            tempoId = 2;
        }
        query.artist_ids = similarToIds[Math.floor((Math.random() * similarToIds.length))];
        uri += "?" + qs.stringify(query);
        MusicGraph.execute(uri, 'get', {tempoId: tempoId}, function (err, json) {
            result.push(json);
            left -= 1;
            if (!left) {
                callback(err, result);
            }
        });

    }
};
MusicGraph.execute = function (uri, method, requestDetails, callback) {
    'use strict';
    request({
        uri: uri,
        method: method
    }, function (err, response, body) {
        var json = JSON.parse(body);
        json.requestDetails = requestDetails;
        callback(err, json);
    });
};
MusicGraph.responseHandler = function (response, body, callback) {
    'use strict';
    var json;
    if (response.statusCode === 200) {
        try {
            json = JSON.parse(body);
            if (json.status && json.status.code !== undefined) {
                if (json.status.code === 0) {
                    callback(null, {pagination: json.pagination, data: json.data});
                } else {
                    callback(json.status);
                }
            } else {
                winston.warn({type: "api", code: json.status});
            }
        } catch (e) {
            winston.log('info', e);
            callback("error");
        }
    } else {
        callback({type: "HTTP", code: response.statusCode});
    }
};
MusicGraph.randomPlaylist = function (artists, options) {
    'use strict';
    var deferred = Q.defer();
    if (!options) {
        options = {};
    }
    if (!options.tempo) {
        options.tempo = "any";
    }
    MusicGraph.randomArtist(artists, function (err, artist) {
        if (!err) {
            MusicGraph.generateArtistPlaylist(artist.musicgraphId, {tempo: options.tempo}, function (err, data) {
                if (!err) {
                    if (data.pagination.count < 1) {
                        deferred.reject("empty playlist");
                    } else {
                        deferred.resolve({playlist: data.data, request_options: options});
                    }
                } else {
                    deferred.reject(err);
                }
            });
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};
/**
 *
 * @param artists: [required]
 * @param options: [optional]
 * @param callback: [required]
 */
MusicGraph.getTrack = function(artists, i, options) {
    "use strict";
    var tempo = MusicGraph.fluidTempo(i, options.number);
    MusicGraph.randomPlaylist(artists, {tempo: tempo.value}, function (err, data) {

    });
};
MusicGraph.playlistFromArtistNames = function (artists, options, callback) {
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
    if (!options.tempo || (options.tempo !== 'any' && options.tempo !== 'increasing' && options.tempo !== 'descending')) {
        options.tempo = "any";
    }
    requests = options.number;
    for (i = 0; i < options.number; i += 1) {
        (function getTrack(i) {
            var tempo = MusicGraph.fluidTempo(i, options.number),
                title,
                artist_name,
                random;
            MusicGraph.randomPlaylist(artists, {tempo: tempo.value})
                .then(function(data) {
                    var valid = false,
                        current_track = {};
                    if (data.playlist.length > 0) {
                        while (!valid) {
                            random = Math.floor((Math.random() * data.playlist.length));
                            title = data.playlist[random].title;
                            artist_name = data.playlist[random].artist_name;
                            valid = true;
                            console.log("got " + data.playlist[random].title + " by " + data.playlist[random].artist_name);
                            playlist.forEach(function (track) {
                                if (track.title === title && track.artist_name === artist_name) {
                                    valid = false;
                                }
                            });
                        }
                        current_track = {title: title, artist_name: artist_name, tempo: tempo};
                            console.log("searching on spotify "+current_track.artist_name+"  "+current_track.title);

                            Spotify.searchTrack({
                                artist: current_track.artist_name,
                                track: current_track.title
                            }).then(
                                function (data) {
                                    if(data.tracks && data.tracks.items) {
                                        current_track.dataType = "api_data";
                                        current_track.source = "spotify";
                                        current_track.link = data.tracks.items[0];
                                        playlist.push(current_track);
                                        requests -= 1;
                                        console.log(requests+" requests left");
                                        if (!requests) {
                                            callback(null, playlist);
                                        }

                                    } else {
                                        console.log("error");
                                        getTrack(i);
                                    }
                                },
                                function (err) {
                                    console.log(err);
                                    console.log("fail!!!!!!!!!!!!!!!");
                                    console.log(err);
                                    getTrack(i);
                                }
                            );


                    } else {
                        console.log(data);
                        valid = false;
                        getTrack(i);
                    }
                }, function (err) {
                    console.log(err);
                    getTrack(i);
                });
        })(i);
    }
};
module.exports = MusicGraph;