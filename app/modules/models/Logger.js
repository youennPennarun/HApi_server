
var Logger = function(req){
    "use strict";
    this.client_ip = req.header['x-fowarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    this.user = req.session.passport.user;
    this.url = req.protocol + '://' + req.get('host') + req.originalUrl;
    this.body = req.body;
}

module.exports = Logger;