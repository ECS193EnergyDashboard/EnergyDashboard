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

            this.launchChart = function() {
                var popup = $window.open('chart-popup.html');
                popup.chartOptions = { };
                popup.chartOptions.interval = this.interval + this.intervalUnits.value;
                popup.chartOptions.webIds = this.webIds;
            };

        }]
    });