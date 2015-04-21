var gcm = require('node-gcm'),
    Raspberry = require('./Raspberry.js'),
    config = require("../assets/private/config.json"),
    gmcCcs = require('node-gcm-ccs'),
    models = require('../modules/mongoose/mongoose-models.js')(),
    Playlist = models.Playlist;
var GCM = function(regId) {
	setRegIf(regId);
};
GCM.regIds = [];
GCM.gcmClient = gmcCcs(585409898471, config.google_config.SERVER_KEY);
GCM.io = null;
GCM.gcmClient.on('message', function(messageId, from, category, data) {
    console.log('received message', data);
    if (data.msg == "pi:sound:resume") {
	Raspberry.isConnected().then(function (socketId) {
            if (socketId) {
		winston.info("resume");
                GCM.io.sockets.connected[socketId].emit('sound:resume');
            } else {
		winston.warning("pi not set");
	    }
        });
    } else if (data.msg == "pi:sound:pause") {
	Raspberry.isConnected().then(function (socketId) {
            if (socketId) {
		winston.info("pause");
                 GCM.io.sockets.connected[socketId].emit('sound:pause');
            } else {
		winston.warning("pi not set");
	    }
        });
    } else if (data.msg == "music:player:next") {
        Playlist.findOne({}, function (err, playlist) {
           if(!err) {
               if (playlist && playlist.tracks.length > playlist.idPlaying) {
                   playlist.idPlaying ++;
                   playlist.save(function (err) {
                       if (!err) {
                           GCM.io.sockets.emit('music:player:next', {"idPlaying": playlist.idPlaying});
                       }
                   })
               } else {
                   console.log("playlist : "+playlist);
               }
           } else {
               console.log("ERROR:"+err);
           }
        });
    } else if (data.msg == "music:player:previous") {
        Playlist.findOne({}, function (err, playlist) {
            if(!err) {
                if (playlist && playlist.idPlaying > 0) {
                    playlist.idPlaying --;
                    playlist.save(function (err) {
                        if (!err) {
                            GCM.io.sockets.emit('music:player:previous', {"idPlaying": playlist.idPlaying});
                        }
                    })
                }
            }
        });
    };
});

this.setRegId = function (regId) {
	if (regId) {
		this.regId = regId;
		GCM.regIs.push(regId);
	}
}
this.emit = function (data) {
	if (this.regId) {
		GCM.send(data,[this.regId]);
	}
}
GCM.broadcast = function (data) {
	if (GCM.regIds) {
		GCM.send(data,GCM.regIds);
	}
}

GCM.send = function (data, clientsIds) {
    data.timestamp = Date.now();
    console.log("======sending============");
    console.log(data);
    console.log("===========================");
    var sender = new gcm.Sender(config.google_config.SERVER_KEY);
    var message = new gcm.Message({
        delayWhileIdle: false,
        timeToLive: 30,
        data: data
    });
    sender.send(message, clientsIds, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
}
module.exports = GCM;
