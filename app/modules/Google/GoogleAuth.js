/*global require*/
/*global module*/
/*global console*/
var mongoose = require("mongoose"),
    models = require('../mongoose/mongoose-models.js')(),
    google = require('googleapis'),
    OAuth2Client = google.auth.OAuth2,
    config = require("../../assets/private/config.json"),


    GoogleAuth = function () {'use strict'; };


GoogleAuth.oauth = new OAuth2Client(config.google_config.CLIENT_ID, config.google_config.CLIENT_SECRET, config.google_config.REDIRECT_URL);

GoogleAuth.getUrl = function () {
    'use strict';
    var url = GoogleAuth.oauth.generateAuthUrl({
        access_type: 'offline',
        approval_prompt: 'force',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
    });
    return url;
};
GoogleAuth.revoke = function () {
    'use strict';
    if (GoogleAuth.isSet()) {
        models.GToken.remove({access_token: GoogleAuth.oauth.credentials.access_token}, function (err, data) {
            if (err) {
                console.log(err);
                throw (err);
            }
        });
        GoogleAuth.oauth.revokeCredentials(function (err, data) {
            /** TODO!!  */
        });
        GoogleAuth.oauth.credentials = null;
    }
};

GoogleAuth.refresh = function () {
    'use strict';
    GoogleAuth.oauth.refreshAccessToken(function (err, tokens) {
        /** TODO!! */
    });
};

GoogleAuth.isExpired = function () {
    'use strict';
    return (GoogleAuth.oauth.credentials !== null && GoogleAuth.oauth.credentials.expiry_date !== null && GoogleAuth.oauth.credentials.expiry_date < Date.now());
};
GoogleAuth.isSet = function () {
    'use strict';
    if (GoogleAuth.isExpired()) {
        console.log("refresh");
        GoogleAuth.refresh();
    }
    return (GoogleAuth.oauth.credentials !== null && GoogleAuth.oauth.credentials.access_token !== null);
};

GoogleAuth.get = function (callback) {
    'use strict';
    models.GToken.findOne(function (err, token) {
        var list = [],
            i = 0;
        if (err) {
            return callback(err);
        } else {
            GoogleAuth.oauth.credentials = token;
        }
    });
};

GoogleAuth.save = function () {
    'use strict';
    var gToken = models.GToken();
    models.GToken.findOne( function (err, token) {
        if (err) {
            console.log(err);
            throw (err);
        }
        if (token === null) {
            gToken.expiry_date = GoogleAuth.oauth.credentials.expiry_date;
            gToken.token_type = GoogleAuth.oauth.credentials.token_type;
            gToken.access_token = GoogleAuth.oauth.credentials.access_token;
            gToken.refresh_token = GoogleAuth.oauth.credentials.refresh_token;
            gToken.save(function (err, saved) {

            });
        } else {
            token.expiry_date = GoogleAuth.oauth.credentials.expiry_date;
            token.token_type = GoogleAuth.oauth.credentials.token_type;
            token.access_token = GoogleAuth.oauth.credentials.access_token;
            token.refresh_token = GoogleAuth.oauth.credentials.refresh_token;
            models.GToken.update({_id: token._id}, token, {}, function () {
                if (err) {
                    throw (err);
                }
            });

        }
    });
};

module.exports = GoogleAuth;