/*jslint browser: true*/
/*jslint nomen: true */
/*jslint es5: true */
/*global haPi*/
/*global $*/
haPi.factory('Log', function ($http, socket, RequestService) {
    "use strict";
    var level = null,
        message = null,
        date = null,
        data = null;
    function Log(level, message, date, data) {
        this.level = level;
        this.message = message;
        this.date = date;
        this.data = data;
    }
    Log.prototype = {
        getLevel: function () {
            return (this.level);
        },
        getMessage: function () {
            return (this.message);
        },
        getDate: function () {
            return (this.date);
        }
    };
    Log.logs = [];
    Log.levels = [
        {name: 'INFO', value: "info"},
        {name: 'LOG', value:  "log"},
        {name: 'WARNING', value:  "warning"}
    ];
    Log.get = function (callback) {
        Log.logs = [];
        RequestService.get('/api/logs', {}, function (response) {
            $.each(response.data.logs, function (key, log) {
                Log.logs.push(new Log(log.level, log.message, new Date(log.timestamp), log.data));
            });
            callback(Log.logs);
        });
    };
    return Log;
});