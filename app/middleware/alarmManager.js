var schedule = require('node-schedule'),
    modules = require("../modules"),
    Alarm = modules.mongoose.models().Alarm,
    Q = require("q"),
    _ = require("lodash");

var init = function(app) {
    "use strict";

    var AlarmManager = function() {};
    AlarmManager.add = function(hours, minutes, repeat, enable) {
        var deferred = Q.defer();
        if (hours && minutes) {
            repeat = repeat || false;
            enable = enable || true;
            console.log(AlarmManager.generateDate(hours, minutes));
            var alarm = new Alarm({
                date: AlarmManager.generateDate(hours, minutes),
                repeat: repeat,
                enable: enable
            });
            alarm.save(function(err, saved) {
                if (!err) {
                    AlarmManager.scheduleAlarm(alarm);
                    deferred.resolve(saved);
                } else {
                    deferred.reject(err);
                }
            });
        } else {
            deferred.reject("invalid data");
        }
        return deferred.promise;
    };

    AlarmManager.getAll = function(options) {
        var deferred = Q.defer();
        Alarm.find({}, function(err, alarms) {
            if (!err) {
                deferred.resolve(alarms);
            } else {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    };

    AlarmManager.update = function(id, alarm) {
        var deferred = Q.defer();
        if (id && alarm) {
            delete alarm._id;
            Alarm.findByIdAndUpdate(id, { $set: alarm}, {multi: false}, function(err, updated) {
                if(!err) {
                    app.cache.get( "job_"+id, function( err, value ){
                        if( !err ){
                            if(value) {
                                value.cancel();
                                AlarmManager.scheduleAlarm(alarm);
                            }
                        }
                    });
                    deferred.resolve(updated);
                } else {
                    deferred.reject(err);
                }
            });
        }
        return deferred.promise;
    };

    AlarmManager.delete = function(id) {
        var deferred = Q.defer();
        if (!id) {
            deferred.reject("invalid parameter");
        }
        Alarm.findOneAndRemove({_id: id}, function (err) {
            if(!err) {
                app.cache.get( "job_"+id, function( err, value ){
                    if( !err ){
                        if(value) {
                            value.cancel();
                        }
                    }
                });
                deferred.resolve();
            } else {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    };

    AlarmManager.generateDate = function (hours, minutes) {
        if (hours !== undefined && minutes !== undefined) {
            var date = new Date();
            if (hours < date.getHours()) {
                date.setDate(date.getDate() + 1);
            } else if (hours === date.getHours()) {
                if (minutes <= date.getMinutes) {
                    date.setDate(date.getDate() + 1);
                }
            }
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(0);
            return date;
        } else {
            return null;
        }
    };

    AlarmManager.execute = function(options) {
        if (options.alarm && options.alarm.enable) {
            if (!options.alarm.repeat) {
                options.alarm.enable = false;
            } else {
                options.alarm.date.setDate(options.alarm.date.getDate()+1);
            }
            AlarmManager.update(options.alarm._id, options.alarm.toObject()).then(function(){}, function(err) {});
            console.log("executing alarm");
            if (!options.fake) {
                app.middleware.player.discover();
            }
        }
    };
    AlarmManager.scheduleAlarm = function(alarm) {
        var now = new Date();
        if(alarm.date > now && alarm.enable) {
            alarm.date = AlarmManager.generateDate(alarm.date.getHours(), alarm.date.getMinutes());
            var job = schedule.scheduleJob(alarm.toObject().date, function () {
                AlarmManager.execute({alarm: alarm});
            });
            app.cache.set("job_" + alarm._id, job, function (err) {
                if (!err) {
                    console.log("new job cached");
                }
            });

        }
    };
    AlarmManager.load = function() {
        AlarmManager.getAll().then(function(alarms) {
            _.forEach(alarms, function(alarm) {
                AlarmManager.scheduleAlarm(alarm);
            });
        }, function(err) {

        });
    };
    AlarmManager.load();

    app.middleware.alarmManager = AlarmManager;
};
module.exports = {
    init: init
}