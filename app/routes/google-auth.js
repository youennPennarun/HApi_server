/*global module*/
/*global require*/
var express = require('express'),
    router = express.Router(),
    google = require('googleapis'),
    OAuth2Client = google.auth.OAuth2,
    GoogleAuth = require('../modules/Google/GoogleAuth.js'),
    GooglePlus = require('../modules/Google/GooglePlus.js'),
    JSONResult = require('../modules/models/JSONResult.js'),
    models = require('../modules/mongoose/mongoose-models.js')();



router.get('/url', function (req, res) {
    "use strict";
    if (!GoogleAuth.isSet()) {
        res.json(new JSONResult(JSONResult.status.success, {"connect_url": GoogleAuth.getUrl()}));
    } else {
        res.json(new JSONResult(JSONResult.status.error, JSONResult.error.ALREADY_SIGNED_IN));
    }
});
router.get('/refresh', function (req, res) {
    "use strict";
    GoogleAuth.refresh();
});
router.get('/isSignedIn', function (req, res) {
    "use strict";
    if (GoogleAuth.isSet()) {
        GooglePlus.userInfo(function (err, user_info) {
            if (!err) {
                res.json(new JSONResult(JSONResult.status.success, {"signed_in": true, "user_info": user_info}));
            } else {
                res.json(new JSONResult(JSONResult.status.error, JSONResult.error.GOOGLE_NOT_SIGNED_UP));
            }
        });
    } else {
        res.json(new JSONResult(JSONResult.status.success, {"signed_in": false}));
    }
});
router.get('/sign-out', function (req, res) {
    "use strict";
    if (GoogleAuth.isSet()) {
        GoogleAuth.revoke();
    }
    res.json({status: "success"});
});
router.get('/oauth2callback', function (req, res) {
    "use strict";
    GoogleAuth.oauth.getToken(req.query.code, function (err, tokens) {
        if (!err) {
            console.log(tokens);
            GoogleAuth.oauth.setCredentials(tokens);
            GoogleAuth.save();
            res.json({status: "success"});
        } else {
            console.log(err);
        }
    });
});
module.exports = router;