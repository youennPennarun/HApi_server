var config = require('../../assets/private/config.json'),
    models = require('../mongoose/mongoose-models.js')(),
	storage = require('node-persist');

var Raspberry = function () {"use strict"; };
Raspberry.ip = null;
Raspberry.socket = null;
Raspberry.playlist = [];
Raspberry.idPlaying = -1;
Raspberry.setIp = function(ip) {
	storage.setItem('pi:ip',ip);
}
Raspberry.getIp = function() {
	return storage.getItem('pi:ip');
}
module.exports = Raspberry;
