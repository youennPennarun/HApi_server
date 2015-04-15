/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("LogController", ["$scope", "$rootScope", "$state", "$modal", "$stateParams", "Log", function ($scope, $rootScope, $state, $modal, $stateParams, Log) {
    "use strict";
    $scope.Log = Log;
    $scope.logs = [];
    $scope.filteredLogs = [];
    $scope.levels = Log.levels.slice();
    $scope.numPerPage = 40;
    $scope.currentPage = 1;
    $scope.sortedSize = 0;
    $.each($scope.levels, function (key) {
        $scope.levels[key].show = true;
    });
    Log.get(function (logs) {
        $scope.logs = logs;
        $scope.sortedSize = logs.length;
        $scope.pageChanged();
        console.log(logs);
    });
    $scope.count = function () {
        var counter = 0;
        $.each($scope.logs, function (key, log) {
            $.each($scope.levels, function (key, levelData) {
                if (log.level === levelData.value && levelData.show) {
                    counter += 1;
                }
            });
        });
        return counter;
    }
    $scope.levelFilter = function (log) {
        var filter = true;
        if ($scope.levels.length > 0) {
            $.each($scope.levels, function (key, levelData) {
                if (log.level === levelData.value && levelData.show) {
                    filter = false;
                }
            });
        }
        return !filter;
    };


    $scope.numPages = function () {
        return Math.ceil($scope.logs.length / $scope.numPerPage);
    };
    $scope.pageChanged = function() {
        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
        , end = begin + $scope.numPerPage;
        
        $scope.filteredLogs = $scope.logs.slice(begin, end);
    };
    $scope.details = function (log) {
        var modalInstance = $modal.open({
            templateUrl: 'views/logDetails.html',
            controller: 'LogDataModal',
            resolve: {
                log: function () {
                    return log;
                }
            }
        });
        modalInstance.result.then(function () {});
    };
}]);
haPi.controller('LogDataModal', function ($scope, $modalInstance, log) {
    'use strict';
    $scope.log = log;
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});