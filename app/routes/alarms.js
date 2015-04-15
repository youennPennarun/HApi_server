/*global require*/
/*global models*/
/*global console*/
/*global module*/
var express = require('express');
var router = express.Router();
var models = require('../modules/mongoose/mongoose-models.js')();
var Alarm = require('../modules/models/Alarm.js'),
    check = require('check-types'),
    JSONResult = require('../modules/models/JSONResult.js'),
    MongooseError = require('../modules/mongoose/MongooseError.js'),
    Emitter = require('../modules/emitter.js'),
    Logger = require('../modules/models/Logger.js'),
    timestamp = require('internet-timestamp');

router.get('/', function (req, res) {
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
router.post('/', function (req, res) {
    "use strict";
    var alarm = new Alarm(null, req.body.time, req.body.repeat, req.body.enable);
    alarm.post(function (err, saved) {
        if (err !== null) {
			Emitter.emitter.emit('alarm:new', alarm);
            res.json(new MongooseError(err).result);
        } else {
            res.json(new JSONResult(JSONResult.status.success, {data : saved}));
        }
    });
});
router.delete('/:id', function (req, res) {
    "use strict";
    var Alarm = models.Alarm;
    Alarm.remove({
        _id : req.param("id")
    }, function (err, todo) {
        if (err) {
            res.send(err);
        }
		Emitter.emitter.emit('alarm:remove', {id:req.param("id")});
        res.json({status: "success"});
    });

});

module.exports = router;
