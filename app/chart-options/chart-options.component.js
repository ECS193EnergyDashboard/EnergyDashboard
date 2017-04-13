angular.module('chartOptionsModule').component('chartOptions', {
        templateUrl: 'chart-options/chart-options.template.html',
        bindings: {
            attributes: '<'
        },
        controller: [ '$window', function($window) {
            var self = this;

            this.intervalOptions = [
                {
                    name: 'minute(s)',
                    value: 'm'
                },
                {
                    name: 'hour(s)',
                    value: 'h'
                },
                {
                    name: 'day(s)',
                    value: 'd'
                },
                {
                    name: 'month(s)',
                    value: 'mo'
                }
            ];

            this.interval = 1;
            this.intervalUnits = this.intervalOptions[1];

            this.yAxisName = '';
            this.title = '';

            this.removeAttribute = function(idx) {
                self.attributes.splice(idx, 1);
            }

            this.clearAttributes = function() {
                self.attributes.length = 0;
            }
            
            this.launchChart = function() {
                var url = 'chart.html?';

                if (this.interval) {
                    url += 'interval='+ this.interval + this.intervalUnits.value + '&';
                }

                if (this.title) {
                    url += 'title='+ this.title + '&';
                }

                if (this.yAxisName) {
                    url += 'yAxis='+ this.yAxisName + '&';
                }

                if (this.attributes) {
                    for (var attrib of this.attributes) {
                        url += 'webId=' + attrib.webId + '&';
                    }
                }

                $window.open(url);
            }
        }]
    });