var express = require('express'),
    router = express.Router(),
    MusicGraph = require('../modules/MusicGraph.js'),
    Spotify = require('../modules/Spotify/Spotify.js');

router.get('/artist/search/:name', function (req, res) {
    MusicGraph.searchArtist({name: req.param('name')}, function (err, data) {
        console.log(data);
    });
});
router.get('/playlist', function (req, res) {
    'use strict';
    var counter = 0,
        response = [];
    Spotify.getMyArtists('me', function (err, data) {
        if (!err) {            
            MusicGraph.generatePlaylist(data, {}, function (err, result) {
                if(err) {
                    console.log(err);
                }  else {
                    result.forEach(function (item) {
                        counter += 1; Spotify.searchTrack({artist:item.artist_name, track: item.title}, function(err, data) {
                            response.push(data.tracks.items[0]);
                            counter -= 1;
                            if (counter === 0 ) {
                                res.json(response);
                            }
                        })
                    });
                }
            });
        } else {
            console.error(err);
        }
    });
});

module.exports = router;