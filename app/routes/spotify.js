/*global require*/
/*global module*/
/*global console*/
var express = require('express'),
    router = express.Router(),
    SpotifyAuth = require('../modules/Spotify/SpotifyAuth.js'),
    Spotify = require('../modules/Spotify/Spotify.js'),
    JSONResult = require('../modules/models/JSONResult.js');

router.get('/sign-in/url', function (req, res) {
    "use strict";
    SpotifyAuth.isSet(function (isSet) {
        if (!isSet) {
            res.json(new JSONResult(JSONResult.status.success, {"connect_url": SpotifyAuth.connectUrl()}));
        } else {
            res.json(new JSONResult(JSONResult.status.error, JSONResult.error.ALREADY_SIGNED_IN));
        }
    });
});
router.get('/sign-in', function (req, res) {
    "use strict";
    var url = SpotifyAuth.connectUrl();
    res.redirect(url);
});
router.get('/isSignedIn', function (req, res) {
    "use strict";
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            SpotifyAuth.userInfo(function (err, user_info) {
                if (!err) {
                    res.json(new JSONResult(JSONResult.status.success, {"signed_in": true, "user_info": user_info}));
                } else {
                    res.json(new JSONResult(JSONResult.status.error, JSONResult.error.UNKNOW));
                }
            });
        } else {
            res.json(new JSONResult(JSONResult.status.success, {"signed_in": false}));
        }
    });
});
router.get('/oauth2callback', function (req, res) {
    "use strict";
    SpotifyAuth.getToken(req.query.code, function (err, data) {
        res.json({err: err, data: data});
    });
});
router.get('/me', function (req, res) {
    "use strict";
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            Spotify.getMe(function (err, data) {
                if (!err) {
                    res.json(new JSONResult(JSONResult.status.success, {user: data}));
                }
            });
        } else {
            res.json(new JSONResult(JSONResult.status.error, {error: ""}));
        }
    });
});
router.get('/me/playlists', function (req, res) {
    "use strict";
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            Spotify.getPlaylists(function (err, data) {
                if (!err) {
                    res.json(new JSONResult(JSONResult.status.success, {user: data}));
                } else {
                    res.json(new JSONResult(JSONResult.status.error, {error: err}));
                    console.error(err);
                }
            });
        } else {
            res.json(new JSONResult(JSONResult.status.error, {error: ""}));
        }
    });
});
router.get('/me/my-music', function (req, res) {
    "use strict";
    Spotify.getMySavedTracks(function (err, data) {
        if (!err) {
            res.json(new JSONResult(JSONResult.status.success, {"my-music": data}));
        } else {
            console.error(err);
        }
    });
});
router.get('/me/my-artists', function (req, res) {
    "use strict";
    SpotifyAuth.isSet();
    Spotify.getMyArtists('me', function (err, data) {
        if (!err) {
            res.json(new JSONResult(JSONResult.status.success, {"my-artists": data}));
        } else {
            console.error(err);
        }
    });
});
router.get('/search/artist/:name', function (req, res) {
    "use strict";
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            var artistName = req.param("name");
            Spotify.searchArtist(artistName, function (err, data) {
                if (!err) {
                    res.json(new JSONResult(JSONResult.status.success, {result: data}));
                } else {
                    res.json(new JSONResult(JSONResult.status.error, {error: err}));
                }
            });
        }
    });
});
router.get('/artist/:id', function (req, res) {
    "use strict";
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            var artistId = req.param("id");
            Spotify.getArtist(artistId, function (err, data) {
                if (!err) {
                    res.json(new JSONResult(JSONResult.status.success, {artist: data}));
                } else {
                    console.error(err);
                    res.json(new JSONResult(JSONResult.status.error, {error: err}));
                }
            });
        }
    });
});
module.exports = router;