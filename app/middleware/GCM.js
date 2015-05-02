var gcm = require('node-gcm'),
    app = require("../../app"),
    modules = require("./../modules"),
    Raspberry = modules.raspberry,
    Playlist = modules.music.playlist,
    config = require("./../assets/private/config.json"),
    gmcCcs = require('node-gcm-ccs'),
    models = modules.mongoose.models(),
    winston = require("winston"),
    PlaylistModel = models.Playlist;
console.log(app);
var    io = app.middleware.io;
var init = function(app) {
    "use strict";
    var GCM = function (regId) {
        if (regId) {
            this.regId = regId;
            if (!GCM.regIs.indexOf(regId)) {
                GCM.regIs.push(regId);
            }
        }
    };
    GCM.regIds = [];
    GCM.gcmClient = gmcCcs(585409898471, config.google_config.SERVER_KEY);
    GCM.gcmClient.on('message', function (messageId, from, category, data) {
        console.log('received message', data);

        if (data.msg === "pi:sound:resume") {
            Raspberry.isConnected().then(function (socketId) {
                if (socketId) {
                    winston.info("resume");
                    io.sockets.connected[socketId].emit('sound:resume');
                } else {
                    winston.warning("pi not set");
                }
            });
        } else if (data.msg === "pi:sound:pause") {
            Raspberry.isConnected().then(function (socketId) {
                if (socketId) {
                    winston.info("pause");
                    io.sockets.connected[socketId].emit('sound:pause');
                } else {
                    winston.warning("pi not set");
                }
            });
        } else if (data.msg === "music:player:next") {
            PlaylistModel.findOne({}, function (err, playlist) {
                if (!err) {
                    if (playlist && playlist.tracks.length > playlist.idPlaying) {
                        playlist.idPlaying++;
                        playlist.save(function (err) {
                            if (!err) {
                                io.sockets.emit('music:player:next', {"idPlaying": playlist.idPlaying});
                            }
                        });
                    } else {
                        console.log("playlist : " + playlist);
                    }
                } else {
                    console.log("ERROR:" + err);
                }
            });
        } else if (data.msg === "music:player:previous") {
            PlaylistModel.findOne({}, function (err, playlist) {
                if (!err) {
                    if (playlist && playlist.idPlaying > 0) {
                        playlist.idPlaying--;
                        playlist.save(function (err) {
                            if (!err) {
                                io.sockets.emit('music:player:previous', {"idPlaying": playlist.idPlaying});
                            }
                        });
                    }
                }
            });
        } else if (data.msg === "music:player:discover") {
            if (data.data) {
                app.middleware.player.discover(data.data);
            } else {
                app.middleware.player.discover();
            }

        } else if (data.msg === "music:playlist:set" && data.data) {
            data.data = JSON.parse(data.data);
            app.middleware.player.setPlaylist(data.data);

        } else if (data.msg === 'pi:sound:volume:set' && data.data) {
            data.data = JSON.parse(data.data);
            Raspberry.isConnected().then(function (socketId) {
                if (socketId) {
                    console.log("emit volume " + data.data.volume);
                    io.sockets.connected[socketId].emit('sound:volume:set', {volume: data.data.volume});
                }
            });

        }
    });

    this.emit = function (data) {
        if (this.regId) {
            GCM.send(data, [this.regId]);
        }
    };
    GCM.broadcast = function (data) {
        if (GCM.regIds) {
            GCM.send(data, GCM.regIds);
        }
    };

    GCM.send = function (data, clientsIds) {
        data.timestamp = Date.now();
        console.log("======sending============");
        console.log(data);
        console.log("===========================");
        var sender = new gcm.Sender(config.google_config.SERVER_KEY);
        var message = new gcm.Message({
            delayWhileIdle: false,
            timeToLive: 5,
            data: data
        });
        sender.send(message, clientsIds, function (err, result) {
            if (err) { console.error(err); }
            else {    console.log(result); }
        });
    };
    app.middleware.gcm = GCM;
};
module.exports = {
    init: init
};
