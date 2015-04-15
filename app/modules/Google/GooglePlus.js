/*global require*/
/*global module*/
var google = require('googleapis'),
    plus = google.plus('v1'),
    GoogleAuth = require('./GoogleAuth.js');
var GooglePlus = function () {"use strict"; };

GooglePlus.userInfo = function (callback) {
    "use strict";
    plus.people.get({ userId: 'me', auth: GoogleAuth.oauth }, function (err, response) {
        if (err) {
            callback(err);
        } else {
            callback(null, response);
        }
    });
};

module.exports = GooglePlus;