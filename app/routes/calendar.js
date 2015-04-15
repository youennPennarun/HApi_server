var express = require('express'),
    router = express.Router(),
    google = require('googleapis'),
    GoogleAuth = require('../modules/Google/GoogleAuth.js'),
    JSONResult = require('../modules/models/JSONResult.js'),
    timestamp = require('internet-timestamp');
/* GET home page. */
router.get('/', function (req, res) {
    "use strict";
    if (GoogleAuth.isSet()) {
        var Calendar = google.calendar({version: 'v3', auth: GoogleAuth.oauth}),
            params = {
                calendarId: "primary"
            };
        Calendar.events.list(params, function (err, response) {
            if (err) {
                res.json(new JSONResult(JSONResult.status.error, err));
            } else {
                var i = 0;
                for (i = 0; i < response.items.length; i += 1) {
                    console.log(response.items[i].end.dateTime + " < " + timestamp(new Date()));
                    if (response.items[i].end.dateTime < timestamp(new Date())) {
                        response.items.splice(i, 1);
                        i -= 1;
                    }
                }
                res.json(new JSONResult(JSONResult.status.success, response));
            }
        });
    } else {
        res.json("unauthorized");
    }

});
module.exports = router;