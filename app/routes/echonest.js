var express = require('express'),
    router = express.Router(),
    JSONResult = require('../modules/models/JSONResult.js'),
    Echonest = require('../modules/Echonest.js');

router.get('/artist/similar/:name', function (req, res) {
    Echonest.searchSimilarArtist({name: req.param('name')}, function (err, data) {
        if (err) {
            res.json(new JSONResult(JSONResult.status.error, {}));
        } else {
            res.json(new JSONResult(JSONResult.status.success, data.response));
        }
    });
});

router.get('/song/search/', function (req, res) {
    Echonest.searchSong(req.query, function (err, data) {
        if (err) {
            res.json(new JSONResult(JSONResult.status.error, {}));
        } else {
            res.json(new JSONResult(JSONResult.status.success, data.response));
        }
    });
});
router.get('/artist/similarSong/:name', function(req, res) {
    var list = [];
    var nbSong = 5;
    var nb = 0;
    var resultList = [];
    Echonest.getSimilarSong({name: req.param('name')}, function (err, data) {
        if (err) {
            res.json(new JSONResult(JSONResult.status.error, {}));
        } else {
            var artistList = data.response.artists;
            for(i = 0 ; i < nbSong ; i +=1 ){
                var random = Math.floor((Math.random() * 10));
                nb += 1;
                Echonest.searchSong({artist_id:artistList[random].id}, function(err, data){
                    random = Math.floor((Math.random() * data.response.songs.length));
                    if(data.response.songs[random].tracks.length > 0){
                        //res.json({data:data.response.songs[random].tracks[0].foreign_id});
                        resultList.push(data.response.songs[random].tracks[0].foreign_id);
                        nb -= 1;
                    } else {
                        console.log(data.response);
                    }
                    if(nb == 0 ){
                        res.json(new JSONResult(JSONResult.status.success, {data:resultList}));
                    }
                });
            }
        } 
    });
});

module.exports = router;