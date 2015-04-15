/*global require*/
/*global models*/
/*global console*/
/*global module*/
var express = require('express'),
    router = express.Router(),
    Logger = require('../modules/Logger.js'),
    JSONResult = require('../modules/models/JSONResult.js');

router.get('/', function (req, res) {
    "use strict";
    res.json(new JSONResult(JSONResult.status.success, {logs: Logger.retrieve()}));
});
module.exports = router;
