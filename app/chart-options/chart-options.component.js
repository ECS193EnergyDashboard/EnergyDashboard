angular.module('chartOptionsModule').component('chartOptions', {
        templateUrl: 'chart-options/chart-options.template.html',
        bindings: {
            webIds: '<'
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

                if (this.webIds) {
                    for (var webId of this.webIds) {
                        url += 'webId=' + webId + '&';
                    }
                }

                $window.open(url);
            }
        }]
    });