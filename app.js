/*jslint nomen: true */
/*jshint es5: false */
/*jshint -W024 */
/*global require*/
/*global static*/
/*global __dirname*/
/*global module*/
/*global process*/
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    config = require('./app/modules/config.js'),
    _ = config,
    schema = require('./app/modules/mongoose/mongoose-schema.js')(),
    models = require('./app/modules/mongoose/mongoose-models.js')(),
    connection = require('./app/modules/mongoose/mongoose-connection')(mongoose, models, config),
    _ = connection,
    GoogleAuth = require('./app/modules/Google/GoogleAuth.js'),
    SoundcloudAuth = require('./app/modules/Soundcloud/SoundcloudAuth.js'),
    SpotifyAuth = require('./app/modules/Spotify/SpotifyAuth.js'),
    MusicGraph = require('./app/modules/MusicGraph.js'),
    passport = require('passport'),
    expressSession = require('express-session'),
    debug = require('debug')('app'),
    storage = require('node-persist'),
    MongoStore = require('connect-mongo')(expressSession),
    sessionStore = new MongoStore({
        mongooseConnection: connection
    }),
    Logger = require("./app/modules/Logger.js"),
    
    app = express();
/*
// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
*/
// uncomment after placing your favicon in /public
app.use(favicon('./app/assets/public/favicon.ico'));

//app.use(Logger.logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Setting static paths
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app/assets/public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(__dirname + '/bower_components'));
/*

app.use(expressSession({
    secret: require('./app/assets/private/config.json').session_secret,
    resave: true,
    saveUninitialized: true
}));
*/
app.use(expressSession({
    key: 'express.sid',
    store: sessionStore,
    secret: require('./app/assets/private/config.json').session_secret,
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

//Gettings dbs
GoogleAuth.get();
SoundcloudAuth.get();
SpotifyAuth.get();

//Init Storage
storage.initSync();
//Setting routes
var routes = require('./app/routes/routes')(app);
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'));
Logger.info("started at " + server.address().address + ":" + server.address().port);
var socketHandler = require('./app/socket/socket.js')(server, sessionStore);