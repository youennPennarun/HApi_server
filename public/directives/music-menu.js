/*jslint browser: true*/
/*jslint es5: true*/
/*global haPi*/
/*global $*/
/*global console*/
haPi.directive('musicMenu', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function (e) {
                e.stopPropagation();
            });
            $(".slider").noUiSlider({
                start:  scope.player.volume,
                connect: "lower",
                range: {
                    'min': 40,
                    'max': 100
                }
            });
            $(".slider").on('slide', function () {
                scope.$apply(function () {
                    scope.player.volume = Math.round($(".slider").val());
                    scope.player.setVolume();
                });
            });
        },
        templateUrl: 'views/music-menu.html'
    };
});