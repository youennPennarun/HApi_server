/*global require*/
/*global console*/
/*global module*/
var mongoose = require("mongoose");
var models = require('../mongoose/mongoose-models.js')();
var check = require('check-types');
var Alarm = function (_id, time, repeat, enable) {
    'use strict';
    this._id = _id;
    this.time = time;
    this.repeat = repeat;
    this.enable = enable;
};
Alarm.prototype.validate = function () {
    'use strict';
    var err = [],
        isErr = false;
    /*
    if(!check.date(this.time)){
        isErr = true;
        console.log(this.time);
        err.push("Invalid time value");
    }
    */
    if (!check.boolean(this.repeat)) {
        isErr = true;
        err.push("Invalid value");
    }
    if (!check.boolean(this.enable)) {
        isErr = true;
        err.push("Invalid value");
    }
    if (isErr) {
        return err;
    } else {
        return null;
    }
};
Alarm.prototype.post = function (callback) {
    'use strict';
    var alarmDB = new models.Alarm();
    console.log("saving...");
    alarmDB.time = this.time;
    alarmDB.enable = this.enable;
    alarmDB.repeat = this.repeat;
    alarmDB.save(function (err, alarm_Saved) {
        if (err) {
            callback(err);
        } else {
            callback(null, alarm_Saved);
        }
    });
};
Alarm.update = function (_id, update, callback) {
    models.Alarm.findById(_id, function (err, alarm) {
        if (update.enable != undefined) {
            alarm.enable = update.enable;
        }
        if (update.repeat != undefined) {
            alarm.repeat = update.repeat;
        }
        alarm.save(function (err) {
            callback(err, alarm);
        });
    });
}

Alarm.get = function (callback) {
    'use strict';
    models.Alarm.find(function (err, alarms) {
        var list = [],
            i = 0;
        if (err) {
            return callback(err);
        } else {
            for (i = 0; i < alarms.length; i += 1) {
                list.push(new Alarm(alarms[i]._id, alarms[i].time, alarms[i].repeat, alarms[i].enable));
            }
            return callback(null, list);
        }
    });
};
Alarm.getOne = function (alarm, callback) {
    'use strict';
    models.Alarm.findOne({_id: alarm._id}, function (err, alarm) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, alarm);
        }
    });
};
Alarm.removeAlarm = function (alarm, callback) {
    'use strict';
    models.Alarm.remove({
        _id : alarm._id
    }, function (err, todo) {
        if (err) {
            console.log("arg");
            callback(err);
        } else {
            callback(null, alarm);
        }
    });
};

module.exports = Alarm;