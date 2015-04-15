/*jslint browser: true*/
/*jslint es5: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.controller("AlarmController", ["$rootScope", "$scope", "$http", "$modal", "Alarm", "socket", function ($rootScope, $scope, $http, $modal, Alarm, socket) {
    "use strict";

    $scope.updateAlarmPanel = function (alarm) {
        $(".alarm-list-accordion .panel").each(function () {
            var checked = $(this).find("input.enable-checkbox");
            if (checked.hasClass("is-checked")) {
                $(this).removeClass("panel-default").addClass("panel-success");
            } else {
                $(this).removeClass("panel-success").addClass("panel-default");
            }
        });

        if (alarm) {
            socket.emit('alarm:update', {"alarm": {"_id": alarm._id, "update": {"enable": alarm.enable, "repeat": alarm.repeat}}});
        }
    };
    $rootScope.$on('socket:connected', function () {
        console.log("connected");
        socket.on('alarm:remove', function (data) {
            var index = -1;
            $.each($scope.alarmList, function (key, value) {
                if (value._id === data.alarm._id) {
                    console.log("found");
                    index = key;
                }
            });
            if (index > -1) {
                $scope.alarmList.splice(index, 1);
            }
            $scope.updateAlarmPanel();
        });

        socket.on('alarm:new', function (data) {
            if (!data.error) {
                $scope.alarmList.push(new Alarm(data.alarm._id, data.alarm.time, data.alarm.enable, data.alarm.repeat));

                if(jQuery().snackbar) {
                    var options =  {
                        content: "Alarm added",
                        style: "toast",
                        timeout: 3000
                    }

                    $.snackbar(options);
                }
                $scope.updateAlarmPanel();
            } else {
                console.log("error");
            }
        }, {unique: true});
        socket.on('alarm:update', function (data) {
            var index;
            $.each($scope.alarmList, function (key, value) {
                if (value._id === data.alarm._id) {
                    index = key;
                }
            });
            if (index) {
                $scope.alarmList[index].time = data.alarm.time;
                $scope.alarmList[index].repeat = data.alarm.repeat;
                $scope.alarmList[index].enable = data.alarm.enable;
                $scope.updateAlarmPanel();
            }
        });
    });
    $scope.delete = function (alarm) {
        alarm.delete()
    };
    $scope.getAlarmList = function () {
        $rootScope.$broadcast('pageLoading:updated', true);
        $scope.alarmList = [];
        Alarm.get(function (list) {
            $scope.alarmList = list;
            $rootScope.$broadcast('pageLoading:updated', false);
            $scope.updateAlarmPanel();
        });
    };

    $scope.alarmList = [];
    $scope.getAlarmList();
    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $scope.updateAlarmPanel();
    });
    $scope.open = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'AlarmModalInstanceCtrl',
            size: 'sm',
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (data) {
        }, function () {"use strict"; });
    };
    $scope.timeOfDay = function (alarm) {
        return alarm.getTimeOfDay();
    }
}]);

haPi.controller('AlarmModalInstanceCtrl', function ($scope, $modalInstance, Alarm) {
    "use strict";
    $scope.cancel = function () {
        $modalInstance.dismiss();
        $scope.deleteNewAlarm();
    };
    $scope.deleteNewAlarm = function () {
        $scope.newAlarm = new Alarm();
        var d = new Date();
        d.setHours(9);
        d.setMinutes(0);
        $scope.newAlarm.time = d;
    };
    $scope.insertAlarm = function () {
        $("#btn-submit-new").prop('disabled', true);
        $("#btn-cancel-new").prop('disabled', true);
        $scope.newAlarm.enable = true;
        $scope.newAlarm.add();
        $modalInstance.close({status: "success" });

    };
    $scope.deleteNewAlarm();
});