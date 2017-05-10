angular.module('chartOptionsModule').component('chartOptions', {
        templateUrl: 'chart-options/chart-options.template.html',
        bindings: {
            attributes: '<'
        },
        controller: [ '$window',  '$scope', function($window, $scope) {
            var self = this;

            this.yAxisName = '';
            this.title = '';
            
            this.numCharts = 1;

            this.range = function(n) {
                return Array.from(Array(n).keys());
            }

            this.removeAttribute = function(idx) {
                this.attributes[idx].chartId = undefined;
                this.attributes.splice(idx, 1);
            }

            this.clearAttributes = function() {
                for (var attrib of this.attributes) {
                    attrib.chartId = undefined;
                }
                this.attributes.length = 0;
            }

            this.pushChart = function() {
                this.numCharts++;
            }

            this.popChart = function() {
                this.numCharts = Math.max(1, this.numCharts - 1);
                for (var attribute of this.attributes) {
                    this.clearAxis(attribute, this.numCharts);
                }
            }

            this.clearAxis = function(attribute, chartId) {
                delete attribute.charts[chartId];
            }
            
            this.launchChart = function() {
                var url = 'chart.html?';

                for (var a of this.attributes) {
                    console.log(a.charts);
                }

                if (this.attributes) {
                    url += 'charts=' + this.numCharts;
                    for (var attrib of this.attributes) {
                        for (var chartId in attrib.charts) {
                            url += '&webId' + 'C' + chartId + 'A' + attrib.charts[chartId] + '=' + attrib.webId;
                        }
                    }
                }
                $window.open(url);
            }

            $scope.$watchCollection('$ctrl.attributes', function() {
                for (var attrib of self.attributes) {
                    if (attrib.charts === undefined) {
                        attrib.charts = { 0: 0 };
                    }
                }
            })
        }]
    });