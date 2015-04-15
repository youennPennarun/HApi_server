var EventEmitter = require('events').EventEmitter

var Emitter = function(){};
Emitter.emitter = new EventEmitter();
module.exports = Emitter;