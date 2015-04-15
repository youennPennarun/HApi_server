/*global require*/
/*global models*/
/*global console*/
/*global module*/
var express = require('express');
var router = express.Router();

router.get('/socket/', function (req, res) {
    "use strict";
    var alarms = [];
    console.log(new Logger(req));
    Alarm.get(function (err, alarms) {
        if (err) {
            console.log(err);
        } else {
            res.json(new JSONResult(JSONResult.status.success, alarms));

        }
    });
});

module.exports = router;
