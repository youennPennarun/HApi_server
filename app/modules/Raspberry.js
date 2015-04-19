var Q = require("q"),
    RaspberryModel = require('./mongoose/mongoose-models.js')().Raspberry;

var Raspberry = function () {};
Raspberry.isConnected = function() {
    var deferred = Q.defer();
    RaspberryModel.findOne({}, function (err, rasp) {
        if (!err) {
            if(rasp && rasp.socketId) {
		console.log("found");
                deferred.resolve(rasp.socketId);
            } else {
		console.log("not set");
                deferred.resolve(false);
            }
        } else {
		console.log(err);
	}
    })
    return deferred.promise;
}
module.exports = Raspberry;
