/*global module*/
/*global console*/
/*global require*/
var config = require('../assets/private/config.json'),
    socketioJwt = require('socketio-jwt'),
    JSONResult = require('../modules/models/JSONResult.js'),
    MusicGraph = require('../modules/MusicGraph.js'),
    Spotify = require('../modules/Spotify/Spotify.js'),
    models = require('../modules/mongoose/mongoose-models.js')(),
    RaspberryModel = models.Raspberry,
    Alarm = require('../modules/models/Alarm.js'),
    JSONResult = require('../modules/models/JSONResult.js'),
    winston = require('winston'),
    Logger = require('../modules/Logger.js');

var socketHandler = function (server) {
    'use strict';
    var io = require('socket.io').listen(server);
    //raspberry = null;

    io.use(socketioJwt.authorize({
        secret: config.jwtSecret,
        handshake: true
    }));

    io.on('connection', function (socket) {
        Logger.info('new client connected as ' + socket.decoded_token.username, {source: 'connection', handshake: socket.handshake});
        require("./musicSocket.js")(io, socket);
        require("./soundSocket.js")(io, socket);
        require("./playlistSocket.js")(io, socket);

        socket.on('pi:is-logged-in', function () {
            RaspberryModel.findOne({}, function (rasp) {
                socket.emit('pi:is-logged-in', (rasp && rasp.socketId !== undefined));
            })
        });

        socket.on('pi:login', function (data) {
            Logger.info('pi logged in', {"socketId": socket.id});
            if (data.name && data.ip) {
		console.log(data.name);
                RaspberryModel.findOne({name: data.name}, function (err, rasp) {
			console.log(rasp);
                   if (rasp) {
                       RaspberryModel.update({name: data.name}, {$set: {socketId: socket.id, ip: data.ip}}, function(err, saved) {
				if(!err){
		                    socket.broadcast.emit('pi:logged-in', rasp);
				}
			});
                   } else {
                       rasp = new RaspberryModel();
                       rasp.socketId = socket.id;
                       rasp.name = data.name;
                       rasp.ip = data.ip;
                       rasp.save(function (err, saved) {
				if(!err){
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
            Logger.info('user disconnected ' + socket.decoded_token.username, {source: 'disconnected', "socketId": socket.id});
            RaspberryModel.findOneAndUpdate ({socketId: socket.id},{socketId: null}, function (err, rasp) {
		if (rasp){
                	Logger.warn('pi disconnected', {source: 'disconnected'});
                	io.sockets.emit('pi:logged-out');
		}
            });
        });
        socket.on('alarm:get', function (data, callback) {
            if (!data || !data.alarm) {
                Alarm.get(function (err, alarms) {
			var response;
                	if (err) {
				response = {"status": "error", "error": err};
                	        Logger.err("error", {source:'alarm:get', error: err});
                	} else {
				response = {"status": "success", "list": alarms};
                    	}
		    	if(callback) {
				callback(response);
		    	} else {
				socket.emit("response:alarm:get", response);
		    	}
                });
            }
        });
        socket.on('alarm:update', function (data) {
            var update;
            if (data.alarm && data.alarm.update) {
                update = data.alarm.update;
                Alarm.update(data.alarm._id, update, function (err, alarm) {
                    if (!err) {
                        Logger.info('new alarm', {source: 'alarm', alarm: alarm});
                        io.sockets.emit('alarm:update', {alarm: alarm});
                    }
                });
            }
        });
        socket.on('alarm:remove', function (data) {
            console.log("removing");
            if (data && data.alarm) {
                Alarm.removeAlarm(data.alarm, function (err, alarm) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("removed");
                        console.log({alarm: alarm});
                        socket.emit("alarm:remove", {alarm: alarm});
                        io.sockets.emit("alarm:remove", {alarm: alarm});
                    }
                });
            }
        });
        socket.on('alarm:add', function (data) {
            if (data && data.alarm) {
                var alarm = new Alarm(null, data.alarm.time, data.alarm.repeat, data.alarm.enable);
                alarm.post(function (err, saved) {
                    if (!err) {
                        Logger.info("New alarm added", {source:'alarm:add', alarm: saved});
                        io.sockets.emit('alarm:new', {alarm: saved});
                    } else {
                        Logger.err('unable to save the alarm', {error: err});
                        socket.emit('alarm:new', {status: 'error', error: err});
                    }
                });
            } else {
                socket.emit('alarm:new', {status: 'error', error: "missing alarm's data"});
            }
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
                                    Spotify.searchTrack({artist: track.artist_name, track: track.title}, function (err, data) {
                                        if (err) {
                                            Logger.err("error on searching track on spotify", {error: err, source: "get:spotify:playlist"});
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
};
module.exports = socketHandler;
