/*global module*/
/*global require*/
/*global console*/
var app = require("./../../../app.js"),
    modules = require("./../../modules"),
    RaspberryModel = modules.mongoose.models().Raspberry,
    Raspberry = modules.raspberry,
    GCM = app.middleware.gcm,
    Spotify = modules.spotify.spotify,
    winston = require('winston');
module.exports = function (io, socket) {
    'use strict';

    socket.on('pi:sound:resume', function (){
        winston.info("requesting resume");
        Raspberry.isConnected().then(function (socketId) {
            if (socketId) {
                winston.info("resume");
                io.sockets.connected[socketId].emit('sound:resume');
            } else {
                winston.warning("pi not set");
            }
        });
    });
    socket.on('pi:sound:pause', function (data){
        winston.info("requesting pause");
        Raspberry.isConnected().then(function (socketId) {
            if (socketId) {
                winston.info("resume");
                io.sockets.connected[socketId].emit('sound:pause');
            } else {
                winston.warning("pi not set");
            }
        });
    });
    socket.on('pi:sound:volume:get', function (){
        Raspberry.isConnected().then(function (socketId) {
            if (socketId) {
                io.sockets.connected[socketId].emit('sound:volume:get');
            }
        });
    });
    socket.on('pi:sound:volume:set', function (data){
        Raspberry.isConnected().then(function (socketId) {
            if (socketId) {
                io.sockets.connected[socketId].emit('sound:volume:set', data);
            }
        });
    });
    socket.on('pi:notify:sound:volume', function (data){
        socket.broadcast.emit('pi:notify:sound:volume', data);
        GCM.broadcast({"pi:player:status": data});
    });
    socket.on('pi:player:status', function (data){
        console.log("pi:player:status->"+data.status);
        socket.broadcast.emit('pi:player:status', data);
        GCM.broadcast({"pi:player:status": data.status});

    });
};
