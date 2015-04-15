/*global console*/
/*global module*/
module.exports = function (mongoose, models, config) {
    "use strict";
    mongoose.connect(config.mongoUri, function (err) {
        if (err) {
            console.log('error occurred, when attempted to connect db. Error: ' + err);
        }
    });
    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
        console.log("connected");
    });
    return db;

};