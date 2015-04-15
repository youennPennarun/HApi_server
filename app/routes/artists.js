/*global require*/
/*global models*/
/*global console*/
/*global module*/
var express = require('express'),
    router = express.Router(),
    Artist = require('../modules/Artist.js'),
    JSONResult = require('../modules/models/JSONResult.js'),
    MongooseError = require('../modules/mongoose/MongooseError.js'),
    Logger = require('../modules/models/Logger.js');

router.get('/refresh', function (req, res) {
    "use strict";
    if (req.session.passport.user) {
        Artist.refresh(req.session.passport.user, function (err, artists) {
            if (err) {
                res.json(new JSONResult(JSONResult.status.error, {error: err}));
            } else {
                res.json(new JSONResult(JSONResult.status.success, {artists: artists}));
            }

        });
    } else {
        res.json(new JSONResult(JSONResult.status.error, null));
    }
});
router.get('/my', function (req, res) {
    if (req.session.passport.user) {
        Artist.get(req.session.passport.user, function (err, artists) {
            if (err) {
                res.json(new JSONResult(JSONResult.status.error, {error: err}));
            } else {
                res.json(new JSONResult(JSONResult.status.success, {artists: artists}));
            }

        });
    } else {
        res.json(new JSONResult(JSONResult.status.error, null));
    }
});

module.exports = router;
