/*es5:true*/
/*global require*/
/*global module*/
/*global console*/
var config = require("../../assets/private/config.json"),
    mongoose = require("mongoose"),
    request = require("request"),
    models = require('../mongoose/mongoose-models.js')(),
    config = require("../../assets/private/config.json");

var SoundcloudAuth = function () {"use strict"; };

SoundcloudAuth.credentials = {
    access_token: null,
    scope: null,
    expires_in: null,
    refresh_token: null
};
SoundcloudAuth.isSet = function () {
    'use strict';
    return (SoundcloudAuth.credentials !== null && SoundcloudAuth.credentials.access_token !== null);
};
SoundcloudAuth.config = config.soundcloud_config;
SoundcloudAuth.connectUrl = function () {
    "use strict";
    return "https://soundcloud.com/connect?client_id=" + config.soundcloud_config.client_id + "&redirect_uri=" + config.soundcloud_config.redirect_url + "&response_type=" + config.soundcloud_config.response_type;
};
SoundcloudAuth.getToken = function (code, callback) {
    "use strict";
    var data = {
        'client_id': config.soundcloud_config.client_id,
        'client_secret': config.soundcloud_config.client_secret,
        'grant_type': 'authorization_code',
        'redirect_uri': config.soundcloud_config.redirect_url,
        'code': code
    };
    request({
        uri: "https://api.soundcloud.com/oauth2/token",
        method: "POST",
        form: data
    }, function (err, response, body) {
        if (!err) {
            var json = JSON.parse(body);
            SoundcloudAuth.credentials = {
                access_token: json.access_token,
                scope: json.scope,
                expires_in: json.expires_in,
                refresh_token: json.refresh_token
            };

            SoundcloudAuth.save();
        }
        callback(err, response);
    });
};


SoundcloudAuth.get = function (callback) {
    'use strict';
    models.SoundcloudToken.findOne(function (err, token) {
        var list = [],
            i = 0;
        if (err) {
            return callback(err);
        } else {
            SoundcloudAuth.credentials = token;
        }
    });
};

SoundcloudAuth.save = function () {
    'use strict';
    var soundcloudToken = models.SoundcloudToken();
    models.SoundcloudToken.findOne( function (err, token) {
        if (err) {
            console.log(err);
            throw (err);
        }
        if (token === null) {
            soundcloudToken.access_token = SoundcloudAuth.credentials.access_token;
            soundcloudToken.scope = SoundcloudAuth.credentials.scope;
            soundcloudToken.expires_in = SoundcloudAuth.credentials.expires_in;
            soundcloudToken.refresh_token = SoundcloudAuth.credentials.refresh_token;
            soundcloudToken.save(function (err, saved) {

            });
        } else {
            token.access_token = SoundcloudAuth.credentials.access_token;
            token.scope = SoundcloudAuth.credentials.scope;
            token.expires_in = SoundcloudAuth.credentials.expires_in;
            token.refresh_token = SoundcloudAuth.credentials.refresh_token;
            models.SoundcloudToken.update({_id: token._id}, token, {}, function () {
                if (err) {
                    throw (err);
                }
            });

        }
    });
};

module.exports = SoundcloudAuth;