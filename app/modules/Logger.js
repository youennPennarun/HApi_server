/*global require*/
/*global module*/
/*global __dirname*/
/*global console*/
var winston = require('winston'),
    fs = require('fs'),
    touch = require("touch"),
    readline = require('readline'),

    logs_path = __dirname + "/../assets/private/",
    app_logs_fn = 'app.log',
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({ level: 'info' }),
            new (winston.transports.File)({ filename:  logs_path + app_logs_fn, level: 'info'})
        ]
    });
var Logger = function () {'use strict'; };

Logger.info = function (str, metadata) {
    'use strict';
    Logger.init();
    var data = {};
    if (metadata !== null) {
        data = {data: metadata};
    }
    logger.log('info', str, data);
};
Logger.log = function (str, metadata) {
    'use strict';
    Logger.init();
    if (metadata === null) {
        metadata = {};
    }
    logger.log('log', str, metadata);
};
Logger.warn = function (str, metadata) {
    'use strict';
    Logger.init();
    if (metadata === null) {
        metadata = {};
    }
    logger.log('warn', str, metadata);
};
Logger.error = function (str, metadata) {
    'use strict';
    Logger.init();
    if (metadata === null) {
        metadata = {};
    }
    logger.log('error', str, metadata);
};
Logger.init = function () {
    'use strict';
    if (!fs.existsSync(logs_path + app_logs_fn)) {
        console.log("creating log file in " + logs_path + app_logs_fn);
        touch.sync(logs_path + app_logs_fn);
    }
};
Logger.retrieve = function (callback) {
    'use strict';
    var logs = [],
        i,
        array = fs.readFileSync(logs_path + app_logs_fn).toString().split('\n');
    for (i in array) {
        if (array[i] !== "") {
            logs.push(JSON.parse(array[i]));
        }
    }
    return logs;
};
Logger.init();
module.exports = Logger;