/*global require*/
/*global models*/
/*global console*/
/*global module*/
var express = require('express');
var router = express.Router(),
    JSONResult = require('../modules/models/JSONResult.js'),
    models = require('../modules/mongoose/mongoose-models.js')(),
    PlaylistModel = models.Playlist;

router.get('/playlist', function (req, res) {
    "use strict";
	var response= {};
    PlaylistModel.findOne({}, function (err, playlist) {
            if (!err) {
                if (playlist) {
                    response = {
                        "playlist": playlist.tracks,
                        "idPlaying": playlist.idPlaying
                    };
                } else {
                    response = {
                        "playlist": [],
                        "idPlaying": -1
                    };
                }
                res.json(new JSONResult(JSONResult.status.success, response));
            } else {
                response = {"status": "error", "error": err};
                res.json(new JSONResult(JSONResult.status.error, err));
            }
        });
});

module.exports = router;
