/*jslint browser: true*/
/*jslint nomen: true */
/*jslint es5: true */
/*global haPi*/
/*global $*/
haPi.factory('Alarm', function ($http, socket, RequestService) {
    "use strict";
    var _id = null,
        hour = null,
        minute = null,
        repeat = false,
        enable = true;
    function Alarm(_id, time, enable, repeat) {
        this._id = _id;
        this.time = time;
        if (enable === null) {
            this.enable = true;
        } else {
            this.enable = enable;
        }
        if (repeat === null || repeat === undefined) {
            this.repeat = false;
        } else {
            this.repeat = repeat;
        }
    }
    Alarm.prototype = {
        getId: function () {
            return (this._id);
        },
        getTime: function () {
            return this.time;
        },
        getTimeOfDay: function () {
            var dateTmp = new Date(this.time),
                date = new Date();
            date.setHours(dateTmp.getHours());
            date.setMinutes(dateTmp.getMinutes());
            return date;
        },
        isEnable: function () {
            return this.enable;
        },
        add: function () {
            socket.emit("alarm:add", {alarm: this});
        },
        delete: function () {
            socket.emit("alarm:remove", {alarm: this});
        }
    };
    Alarm.get = function (callback) {
        RequestService.get('/api/alarms', {}, function (response) {
            var alarmList = [];
            $.each(response.data, function (key, alarm) {
                alarmList.push(new Alarm(alarm._id, alarm.time, alarm.enable, alarm.repeat));
            });
            callback(alarmList);
        });
    };

    return Alarm;
});