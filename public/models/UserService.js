/*global haPi*/
/*global console*/
haPi.service("UserService", [ "$http", '$rootScope', "RequestService", function ($http, $rootScope, RequestService) {
    'use strict';
    this.user = null;
    this.login = function (data, callback) {
        var requestService = this;
        RequestService.post("/user/login", data, function (response) {
            if (response.status === "SUCCESS") {
                requestService.user = response.data;
                $rootScope.$broadcast('user:updated', response.data);
            }
            callback(response);
        });
    };
    this.isAuthorized = function (callback) {
        var service = this;
        if (this.user === null) {
            this.getUser(function () {
                if (service.user === null) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            callback(true);
        }
        
    };
    this.logout = function (callback) {
        var requestService = this;
        this.user = null;
        RequestService.get("/user/logout", {}, function (response) {
            requestService.user = null;
            $rootScope.$broadcast('user:updated', requestService.user);
            callback(response);
        });
    };
    this.getUser = function (callback) {
        var requestService = this;
        RequestService.get("/user", {}, function (response) {
            if (response.status === "SUCCESS") {
                requestService.user = response.data;
                $rootScope.$broadcast('user:updated', requestService.user);
            } else {
                requestService.user = null;
            }
            callback(response);
        });
    };
    this.changePassword = function (user, callback) {
        if (user && user.oldPassword && user.newPassword && user.newPassword === user.confirmPassword) {
            var data = {
                oldPassword: user.oldPassword,
                newPassword: user.newPassword,
                confirmPassword: user.confirmPassword
            };
            RequestService.post("/user/edit-password", data, function (response) {
                if (response.status === "SUCCESS") {
                    callback(response);
                } else {
                    callback(response);
                }
            });
        }
    };
}]);