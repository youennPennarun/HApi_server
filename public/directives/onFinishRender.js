/*jslint browser: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.directive('onFinishRender', function ($timeout) {
    "use strict";
    return function (scope, element, attrs) {
        if (scope.$last) {
            $timeout(function () {
                scope.$emit('ngRepeatFinished');
            });
        }
    };
});