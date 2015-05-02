/*global module*/
/*global console*/
/*global require*/
var config = require('../../assets/private/config.json'),
    socketioJwt = require('socketio-jwt'),
    JSONResult = require('../../modules/models/JSONResult.js'),
    MusicGraph = require('../../modules/MusicGraph.js'),
    Spotify = require('../../modules/Spotify/Spotify.js'),
    models = require('../../modules/mongoose/mongoose-models.js')(),
    RaspberryModel = models.Raspberry,
    JSONResult = require('../../modules/models/JSONResult.js'),
    winston = require('winston'),
    Logger = require('../../modules/Logger.js'),
    server = require("../../../app.js").server;
var init = function(app) {
    "use strict";
    var io = require('socket.io').listen(server);
//raspberry = null;
    io.use(socketioJwt.authorize({
        secret: config.jwtSecret,
        handshake: true
    }));

    io.on('connection', function (socket) {
        Logger.info('new client connected as ' + socket.decoded_token.username, {
            source: 'connection',
            handshake: socket.handshake
        });
        require("./musicSocket.js")(io, socket);
        require("./soundSocket.js")(io, socket);
        require("./playlistSocket.js")(io, socket);

        socket.on('pi:is-logged-in', function (callback) {
            RaspberryModel.findOne({}, function (rasp) {
                console.log("response for pi logged in = " + (rasp && rasp.socketId !== undefined));
                if (!callback) {
                    socket.emit('pi:is-logged-in', (rasp && rasp.socketId !== undefined));
                } else {
                    callback((rasp && rasp.socketId !== undefined));
                }
            });
        });

        socket.on('pi:login', function (data) {
            Logger.info('pi logged in', {"socketId": socket.id});
            if (data.name && data.ip) {
                console.log(data.name);
                RaspberryModel.findOne({name: data.name}, function (err, rasp) {
                    console.log(rasp);
                    if (rasp) {
                        RaspberryModel.update({name: data.name}, {
                            $set: {
                                socketId: socket.id,
                                ip: data.ip
                            }
                        }, function (err, saved) {
                            if (!err) {
                                socket.broadcast.emit('pi:logged-in', rasp);
                            }
                        });
                    } else {
                        rasp = new RaspberryModel();
                        rasp.socketId = socket.id;
                        rasp.name = data.name;
                        rasp.ip = data.ip;
                        rasp.save(function (err, saved) {
                            if (!err) {
                                socket.broadcast.emit('pi:logged-in', rasp);
                            }
                        });
                    }
                });
            }
        });
        socket.on('pi:cpu', function (data) {
            socket.broadcast.emit("pi:cpu", data);
        });
        socket.on('disconnect', function () {
            Logger.info('user disconnected ' + socket.decoded_token.username, {
                source: 'disconnected',
                "socketId": socket.id
            });
            RaspberryModel.findOneAndUpdate({socketId: socket.id}, {socketId: null}, function (err, rasp) {
                if (rasp) {
                    Logger.warn('pi disconnected', {source: 'disconnected'});
                    io.sockets.emit('pi:logged-out');
                }
            });
        });
        socket.on('get:spotify:playlist', function (data) {
            var nbSongs = 5,
                nb = 0,
                resultList = [],
                artist,
                track;
            while (nb < nbSongs) {
                nb += 1;
                MusicGraph.searchArtist({similar_to: data.artist}, function (err, data) {
                    if (!err) {
                        if (data.data.length > 0) {
                            artist = data.data[Math.floor((Math.random() * data.data.length))];
                            console.log("getting playlist for " + artist.sort_name);
                            Logger.info("getting playlist for " + artist.sort_name, {source: "get:spotify:playlist"});
                            MusicGraph.playlist({artist_ids: artist.id}, function (err, data) {
                                if (!err) {
                                    track = data.data[Math.floor((Math.random() * data.data.length))];
                                    Spotify.searchTrack({
                                        artist: track.artist_name,
                                        track: track.title
                                    }, function (err, data) {
                                        if (err) {
                                            Logger.err("error on searching track on spotify", {
                                                error: err,
                                                source: "get:spotify:playlist"
                                            });
                                            console.log("error");
                                            console.log(err);
                                        } else {
                                            if (data.tracks.items.length) {
                                                resultList.push(data.tracks.items[0]);
                                                nb -= 1;
                                                if (!nb) {
                                                    console.log(resultList);
                                                    socket.emit("playlist", resultList);
                                                }
                                            } else {
                                                Logger.warn("not found");
                                            }
                                        }

                                    });

                                } else {
                                    Logger.err("error when getting playlist for " + artist.sort_name);
                                }
                            });
                        }
                    } else {
                        Logger.err("error when searching " + data.artist);
                    }
                });
            }
        });
    });
    app.middleware.io = io;
};
module.exports = {
    init: init
};
