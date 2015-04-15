haPi.service("RequestService", [ "$http", "$location", function ($http, $location) {
    'use strict';
    this.get = function (uri, data, callback) {
        $http.get(uri,{ params: data }).success(function (response) {
            globalErrorHandler(response, callback);
        });
    };
    this.post = function (url, data, callback) {
        $http.post(url, data).success(function (response) {
            globalErrorHandler(response, callback);
        });
    };


    var globalErrorHandler = function (response, callback) {
        if (response.status === "ERROR") {
            if (response.data.code === 401) {
                console.log(401);
                $location.path("login");
            } else {
                callback(response);
            }
        } else {
            callback(response);
        }
    };
}]);