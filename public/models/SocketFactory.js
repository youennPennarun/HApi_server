/*jslint browser: true*/
/*jslint nomen: true */
/*global haPi*/
/*global $*/
/*global console*/
/*global io*/
haPi.factory('socket', function ($location, $rootScope) {
    'use strict';
    var socket = null,
        url = $location.protocol() + '://' + $location.host() + ':' +  $location.port();
    $rootScope.$on('user:updated', function (event, user) {
        if (socket && socket.connected) {
        } else {
            socket =  io.connect(url, {'query': 'token=' + user.token});
        }
        socket.on("connect", function () {
            $rootScope.$emit('socket:connected');
            socket.emit("pi:is-logged-in");
        });
        socket.on("error", function (error) {
            if (error.type === "UnauthorizedError" || error.code === "invalid_token") {
                $rootScope.$emit('socket:unauthorized');
                $rootScope.$broadcast('socket:unauthorized');
                $location.path("login");
            } else {
                console.log(error);
            }
        });
    });
    return {
        on: function (eventName, callback, options) {
            if (socket) {
                if (options && options.unique) {
                    console.log("remove", eventName);
                    socket.removeListener(eventName, callback);
                }
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }
        },
        emit: function (eventName, data, callback) {
            if (socket) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            } else {
                console.log(socket);
            }
        },
        remove : function (eventName, callback) {
            if (socket) {
                socket.removeListener(eventName, callback);
            }
        }
    };
});