/*es5:true*/
/*global require*/
/*global module*/
/*global console*/
var config = require("../../assets/private/config.json"),
    mongoose = require("mongoose"),
    request = require("request"),
    models = require('../mongoose/mongoose-models.js')(),
    config = require("../../assets/private/config.json"),
    Spotify = require("./Spotify.js");

var SpotifyAuth = function () {"use strict"; };

SpotifyAuth.credentials = {
    access_token: null,
    scope: null,
    expires_date: null,
    refresh_token: null
};


SpotifyAuth.isSet = function (callback) {
    'use strict';
    var d = new Date();
    if ((!SpotifyAuth.credentials || !SpotifyAuth.credentials.access_token)) {
        callback(false);
    } else {
        if (SpotifyAuth.credentials.expires_date < d.getTime()) {
            Spotify.SpotifyApi.refreshAccessToken().then(
                function (data) {
                    d.setHours(d.getHours() + 1);
                    SpotifyAuth.credentials.expires_date = d.getTime();
                    SpotifyAuth.credentials.access_token = data.access_token;
                    SpotifyAuth.save();
                    callback((SpotifyAuth.credentials !== null && SpotifyAuth.credentials.access_token !== null));
                },
                function (err) {
                    console.log(err);
                    callback(false);
                }
            );

        } else {
            callback((SpotifyAuth.credentials !== null && SpotifyAuth.credentials.access_token !== null));
        }
    }
};
SpotifyAuth.config = config.spotify_config;
SpotifyAuth.connectUrl = function () {
    "use strict";
    return "https://accounts.spotify.com/authorize?client_id=" + config.spotify_config.client_id + "&redirect_uri=" + config.spotify_config.redirect_url + "&response_type=" + config.spotify_config.response_type +
        "&scope=" + config.spotify_config.scope;
};
SpotifyAuth.getToken = function (code, callback) {
    "use strict";
    var data = {
        'client_id': config.spotify_config.client_id,
        'client_secret': config.spotify_config.client_secret,
        'grant_type': 'authorization_code',
        'redirect_uri': config.spotify_config.redirect_url,
        'code': code
    };
    request({
        uri: "https://accounts.spotify.com/api/token",
        method: "POST",
        form: data
    }, function (err, response, body) {
        var d = new Date(),
            json = JSON.parse(body);
        d.setHours(d.getHours() + 1);
        console.log(d.getTime);
        if (!err) {
            SpotifyAuth.credentials = {
                access_token: json.access_token,
                scope: json.scope,
                expires_date: d.getTime(),
                refresh_token: json.refresh_token
            };

            SpotifyAuth.save();
        }
        callback(err, response);
    });
};


SpotifyAuth.get = function (callback) {
    'use strict';
    models.SpotifyToken.findOne(function (err, token) {
        var list = [],
            i = 0;
        if (err) {
            return callback(err);
        } else {
            if (token) {
                SpotifyAuth.credentials = token;
                Spotify.SpotifyApi.setAccessToken(SpotifyAuth.credentials.access_token);
                Spotify.SpotifyApi.setRefreshToken(SpotifyAuth.credentials.refresh_token);
            }
        }
    });
};
SpotifyAuth.refresh = function (callback) {
    'use strict';
    Spotify.SpotifyApi.refreshAccessToken().then(function (data) {
        SpotifyAuth.credentials.access_token = data.access_token;
        SpotifyAuth.save();
        console.log("refreshed");
        callback(null, data);
    }, function (err) {
        console.log(err);
        callback(err);
    });
};
SpotifyAuth.userInfo = function (callback) {
    "use strict";
    var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + SpotifyAuth.credentials.access_token
        },
        json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function (err, response, body) {
        callback(err, body);
    });
};

SpotifyAuth.save = function () {
    'use strict';
    var spotifyToken = models.SpotifyToken();
    models.SpotifyToken.findOne(function (err, token) {
        if (err) {
            console.log(err);
            throw (err);
        }
        if (token === null) {
            spotifyToken.access_token = SpotifyAuth.credentials.access_token;
            spotifyToken.scope = SpotifyAuth.credentials.scope;
            spotifyToken.expires_date = SpotifyAuth.credentials.expires_date;
            spotifyToken.refresh_token = SpotifyAuth.credentials.refresh_token;
            Spotify.SpotifyApi.setAccessToken(SpotifyAuth.credentials.access_token);
            Spotify.SpotifyApi.setRefreshToken(SpotifyAuth.credentials.refresh_token);
            spotifyToken.save(function (err, saved) {
            });
        } else {
            token.access_token = SpotifyAuth.credentials.access_token;
            token.scope = SpotifyAuth.credentials.scope;
            token.expires_date = SpotifyAuth.credentials.expires_date;
            token.refresh_token = SpotifyAuth.credentials.refresh_token;
            Spotify.SpotifyApi.setAccessToken(SpotifyAuth.credentials.access_token);
            Spotify.SpotifyApi.setRefreshToken(SpotifyAuth.credentials.refresh_token);
            models.SpotifyToken.update({_id: token._id}, token, {}, function () {
                if (err) {
                    throw (err);
                }
            });

        }
    });
};

module.exports = SpotifyAuth;