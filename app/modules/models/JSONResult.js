/*global require*/
/*global module*/
var JSONMessages = require("../../assets/public/JSONMessages.json");
var JSONResult = function (status, data) {
    'use strict';
    if (data === null) {
        data = {};
    }
    var jsonData = {status: status, data: data};
    return jsonData;
};

JSONResult.status = JSONMessages.status;
JSONResult.error = JSONMessages.error;
module.exports = JSONResult;
