'use strict';

angular.module('colorTestModule', [ ])
    .component('colorTest', {
        templateUrl: 'color-test/color-test.template.html',
        controller: [ function() {
            var self = this;

            function rgb(r, g, b) {
                return { r: r, g: g, b: b };
            }

            this.range = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            this.minColor = rgb(0, 0, 255), this.maxColor = rgb(255, 0, 0), this.midColor = rgb(255, 255, 255);

            this.colors = gradient(0, this.minColor, 10, this.maxColor, this.midColor);

            this.style = function(i) {
                var style = { width: '100%', height: '50px' };
                var c = this.colors(i);
                style['background-color'] = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
                return style;
            }

        }]
    });