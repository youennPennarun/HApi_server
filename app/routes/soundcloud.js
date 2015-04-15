var express = require('express'),
    router = express.Router(),
    SoundcloudAuth = require('../modules/Soundcloud/SoundcloudAuth.js'),
    Soundcloud = require('../modules/Soundcloud/Soundcloud.js');

router.get('/sign-in', function (req, res) {
    var url = SoundcloudAuth.connectUrl();
    res.redirect(url);
});
router.get('/isSignedIn', function (req, res) {
    return SoundcloudAuth.isSet();
});
router.get('/oauth2callback', function (req, res) {
    SoundcloudAuth.getToken(req.query.code, function (err, data) {
        res.json({err:err, data: data});
    });
});
router.get('/track/:search', function (req, res) {
    Soundcloud.searchTrack({q: req.param("search")}, function(err, data){
        res.json({err:err,data:data});
    })
});
router.get('/track/:id/stream', function (req, res) {
    res.json(Soundcloud.getStreamUrl(req.param("id")));
});
module.exports = router;