/*global require*/
/*global console*/
/*global module*/
var express = require('express');
var router = express.Router();
var models = require('../modules/mongoose/mongoose-models.js')(),
    check = require('check-types'),
    JSONResult = require('../modules/models/JSONResult.js'),
    MongooseError = require('../modules/mongoose/MongooseError.js'),
    Emitter = require('../modules/emitter.js'),
    Logger = require('../modules/models/Logger.js'),
    timestamp = require('internet-timestamp'),
    app = require("../../app.js");

router.get('/', function (req, res) {
    "use strict";
    var alarms = [];
    app.middleware.alarmManager.getAll(req.query).then(
        function(alarms) {
            res.json(new JSONResult(JSONResult.status.success, {items: alarms}));
        }, function(err) {
            res.json(new JSONResult(JSONResult.status.error, err));
        });
});
router.post('/', function (req, res) {
    "use strict";
    app.middleware.alarmManager.add(req.body.hours, req.body.minutes,
        req.body.repeat, req.body.enable).then(function(saved) {
            res.json(new JSONResult(JSONResult.status.success, saved));
        }, function(err) {
            res.json(new JSONResult(JSONResult.status.error, err));
        });
});
router.delete('/:id', function (req, res) {
    "use strict";
    app.middleware.alarmManager.delete(req.param("id")).then(
        function() {
            res.json(new JSONResult(JSONResult.status.success));
        }, function(err) {
            console.log(err);
            res.json(new JSONResult(JSONResult.status.error, err));
        }
    );

});
router.put('/:id', function (req, res) {
    "use strict";
    console.log(req.params);
    console.log(req.body);
    app.middleware.alarmManager.update(req.params.id, req.body).then(
        function(alarm) {
            res.json(new JSONResult(JSONResult.status.success, alarm));
        }, function(err) {
            res.json(new JSONResult(JSONResult.status.error, err));
        }
    );

});

module.exports = router;
