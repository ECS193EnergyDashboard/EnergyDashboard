'use strict';

angular.module('colorTestModule', [ ])
    .component('colorTest', {
        templateUrl: 'color-test/color-test.template.html',
        controller: [ function() {
            var self = this;

            function rgb(r, g, b) {
                return { r: r, g: g, b: b };
            }

            function range(n) {
                return Array.from(Array(n).keys());
            }

            this.n = 30;

            this.onNChanged = function() {
                this.range = range(this.n);
            }

            this.range = range(this.n);

            this.names = [ "Min", "Mid", "Max" ];

            this.points = [ 
                { value: 0.0, color: rgb(0, 0, 255) },
                { value: 0.5, color: rgb(255, 255, 255) },
                { value: 1.0, color: rgb(255, 0, 0) }
            ];

            this.colors = gradient(this.points);

            this.style = function(i) {
                var style = { width: '100%', height: '10px' };
                var c = this.colors(i / (this.n - 1));
                style['background-color'] = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
                return style;
            }

        }]
    });