var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    config = require('./config'),
    User = require('../../modules/mongoose/mongoose-models.js')().User;

var ini = function (callback) {
    User.findOne(function (err, user) {
        if (!err) {
            if (user === null) {
                var newUser = new User();
                newUser.username = config.default_admin.username;
                newUser.password = newUser.generateHash( config.default_admin.password);
                newUser.save(function (err, user) {
                    console.log("saved user ('"+config.default_admin.username+"', '"+config.default_admin.password+"')");
                    callback();
                });
            } else {
                callback();
            }
        }
    });
};
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
module.exports = passport.use(new LocalStrategy(
    function (username, password, done) {
        "use strict";
        ini(function () {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        });
    }
));
