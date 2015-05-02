var JSONResult = require('../modules/models/JSONResult.js'),
    config =  require('../assets/private/config.json');

// route middleware to make sure a user is logged in
var isLoggedIn = function (req, res, next) {
    "use strict";
    console.log(req.isAuthenticated());
    if (!config.sign_in_required) { return next(); }
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        console.log("OK");

        return next();
    } else {
        console.log("STOP");
        // if they aren't redirect them to the home page
        res.json(new JSONResult(JSONResult.status.error, JSONResult.errors.NOT_LOGGED_IN));
    }
};
var routes = function (app) {
    "use strict";


    app.use('/', require('./index'));
    app.use('/user', require('./user'));


    app.all('/api/*', isLoggedIn, function (req, res, next) {
        next();
    });
    app.use('/api/logs', app.scribe.webPanel());
    app.use('/api/alarms', require('./alarms'));
    app.use('/api/google-auth', require('./google-auth'));
    //app.use('/calendar', require('./calendar'));

    app.use('/api/calendar', require('./calendar'));
    app.use('/api/soundcloud', require('./soundcloud'));
    app.use('/api/musicgraph', require('./musicgraph'));
    app.use('/api/echonest', require('./echonest'));
    app.use('/api/spotify', require('./spotify'));
    app.use('/api/artists', require('./artists'));
    app.use('/api/player', require('./player'));
    app.use('/api/logs', require('./logs'));

};
module.exports = routes;
