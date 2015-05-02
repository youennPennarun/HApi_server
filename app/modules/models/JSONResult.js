/*global require*/
/*global module*/
var _ = require("lodash");
var JSONMessages = require("../../assets/public/JSONMessages.json");
var JSONResult = function (status, data) {
    'use strict';
    var jsonData = {};
    if (data === null) {
        data = {};
    }
    if (status === JSONResult.status.success) {
        jsonData = {status: status, data: data};
    } else {
        if (_.isString(data)) {
            data = {message: data};
        }
        jsonData = {status: status, err: data};
    }
    return jsonData;
};

JSONResult.status = JSONMessages.status;
JSONResult.errors = JSONMessages.errors;
module.exports = JSONResult;
