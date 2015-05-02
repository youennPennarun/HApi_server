var app = require("../../app.js"),
    express = require('express'),
    jwt = require('jsonwebtoken'),
    router = express.Router(),
    modules = require("../modules"),
    passport = require("../assets/private/passport.js"),
    JSONResult = modules.models.jsonResult,
    config = require('../assets/private/config.json'),
    Spotify = modules.spotify.spotify,
    SpotifyAuth = modules.spotify.spotifyAuth,
    User = modules.mongoose.models().User;

router.get("/", function(req, res) {
    res.json(new JSONResult(JSONResult.status.success, req.session.passport.user));
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/loginSuccess',
    failureRedirect: '/user/loginFail',
    failureFlash: false
}));
router.post('/edit-password', function (req, res) {
    if (req.session.passport.user && req.body.oldPassword && req.body.newPassword && req.body.confirmPassword) {
        User.findOne({username: req.session.passport.user.username}, function (err, user) {
            if (user.validPassword(req.body.oldPassword)) {
                if (req.body.newPassword == req.body.confirmPassword) {
                    user.password = user.generateHash(req.body.newPassword);
                    user.save(function (err, saved) {
                        res.json(new JSONResult(JSONResult.status.success, {}));
                    });
                }
            } else {
                res.json(new JSONResult(JSONResult.status.error, {"error": "invalid old password"}));
            }
        });
    } else {
        res.json(new JSONResult(JSONResult.status.error, {"error": "missing data"}));
    }
});
router.post('/login/token', function (req, res) {
    var username = req.body.username,
        password = req.body.password;
    User.findOne({username: username}, function (err, user) {
        if (!err) {
            if (user !== null && user.validPassword(password)) {
                //var token = jwt.sign(user, config.jwtSecret, { expiresInMinutes: 7 * 24 * 60 });
                var token = jwt.sign(user, config.jwtSecret, { expiresInMinutes: 0 });

                res.json(new JSONResult(JSONResult.status.success, {token: token}));

            } else {
                res.json(new JSONResult(JSONResult.status.failure, {error: "invalid user"}));
            }
        } else {
            res.json(new JSONResult(JSONResult.status.failure, {error: "unknown"}));
        }
    });

});
router.get('/loginSuccess', function (req, res) {
    var token = jwt.sign(req.session.passport.user, config.jwtSecret, { expiresInMinutes: 60*5 });
    req.session.passport.user.token = token;
    res.json(new JSONResult(JSONResult.status.success, req.session.passport.user));
});
router.get('/loginFail', function (req, res) {
    res.json(new JSONResult(JSONResult.status.error, JSONResult.error.LOGIN_FAILED));
});
router.get('/logout', function(req, res){
    req.logout();
    res.json({});
});

router.get('/playlists', function (req, res) {
    SpotifyAuth.isSet(function (isSet) {
        if (isSet) {
            console.log("GET PLAYLIST");
            Spotify.getPlaylists(function (err, data) {
                if (!err) {
                    res.json(new JSONResult(JSONResult.status.success, data));
                } else {
                    console.log("error: "+err);
                    res.json(new JSONResult(JSONResult.status.failure, {error: err, "source": "spotify"}));
                }

            });
        } else {
            res.json(new JSONResult(JSONResult.status.failure, {error: "invalid user"}));
        }
    });
});
router.post('/GCM', function (req, res) {
	if (req.body && req.body.regId) {
		console.log("NEW REGiD:"+req.body.regId);
		app.middleware.gcm.regIds.push(req.body.regId);
                res.json(new JSONResult(JSONResult.status.success));
	}
    
});
module.exports = router;
