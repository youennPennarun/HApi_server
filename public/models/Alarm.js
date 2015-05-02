var modules = require("./"),
    AlarmModel
    Q = require("q");

var Alarm = function(_id, time, enable, repeat) {
    "use strict";
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
};
Alarm.prototype = {
    getId: function () {
        "use strict";
        return (this._id);
    },
    getTime: function () {
        "use strict";
        return this.time;
    },
    getTimeOfDay: function () {
        "use strict";
        var dateTmp = new Date(this.time),
            date = new Date();
        date.setHours(dateTmp.getHours());
        date.setMinutes(dateTmp.getMinutes());
        return date;
    },
    isEnable: function () {
        "use strict";
        return this.enable;
    }
};
Alarm.get = function (callback) {
    "use strict";
};
module.exports = Alarm;