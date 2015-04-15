var request = require("request"),
    qs = require('qs'),
    SoundcloudAuth = require("./SoundcloudAuth.js");
    
var Soundcloud = function () {"use strict"; };
Soundcloud.searchTrack = function (data, callback) {
    var uri = "http://api.soundcloud.com/tracks.json";
    data.client_id = SoundcloudAuth.config.client_id;
    console.log(data);
    uri += "?" + qs.stringify(data);
    request({
        uri: uri,
        method: "GET"
    }, function (err, response, body) {
        callback(err, body);
    });
};
Soundcloud.getStreamUrl = function (trackId) {
    return " http://api.soundcloud.com/tracks/" + trackId + "/stream?client_id="+SoundcloudAuth.config.client_id;
}
module.exports = Soundcloud;