var JSONResult = require('../models/JSONResult.js');
var GoogleError = function (err) {
    var error = err.errors[0].reason;
    this.setResult(err, error);
}
GoogleError.prototype.setResult = function (err, reason) {
    "use strict";
    var errorMessage = JSONResult.error.UNKNOWN;
    switch(reason) //mot-clé de la réponse du fichier php
    {
        case "authError":
            errorMessage = JSONResult.error.GOOGLE_UNAUTHORIZED;
            break;
        case "appNotInstalled":
            errorMessage = JSONResult.error.GOOGLE_APP_NOT_INSTALLED;
            break;
        case "appAccess":
            errorMessage = JSONResult.error.GOOGLE_APP_NOT_GRANTED;
            break;
        case "userAccess":
            errorMessage = JSONResult.error.GOOGLE_INVALID_ACCESS_LEVEL;
            break;
        case "appNotConfigured":
            errorMessage = JSONResult.error.GOOGLE_APP_CONF_ERROR_DRIVE;
            break;
        case "appBlacklisted":
            errorMessage = JSONResult.error.GOOGLE_APP_BLACKLISTED;
            break;
        case "notFound":
            errorMessage = JSONResult.error.GOOGLE_FILE_NOT_FOUND;
            break;
        default: errorMessage = JSONResult.error.UNKNOWN;
    }
    errorMessage.original_error = err;
    this.result = new JSONResult(JSONResult.status.error, errorMessage);
}

GoogleError.prototype.getResult = function () {
    "use strict";
    return this.result;
}