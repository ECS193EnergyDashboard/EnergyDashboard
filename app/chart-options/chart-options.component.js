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
                    var id = attribute.chartId;
                    if (this.chartFromId(id) === this.numCharts) {
                        attribute.chartId = this.createId(this.chartFromId(id) - 1, this.axisFromId(id))
                    }
                }
            }

            this.createId = function(chart, axis) {
                return chart * 2 + axis;
            }

            this.chartFromId = function(id) {
                return Math.floor(id / 2);
            }

            this.axisFromId = function(id) {
                return id % 2;
            }
            
            this.launchChart = function() {
                var url = 'chart.html?';

                if (this.attributes) {
                    url += 'charts=' + this.numCharts;
                    for (var attrib of this.attributes) {
                        url += '&webId' + 'C' + this.chartFromId(attrib.chartId) + 'A' + this.axisFromId(attrib.chartId) + '=' + attrib.webId;
                    }
                }

                $window.open(url);
            }

            $scope.$watchCollection('$ctrl.attributes', function() {
                for (var attrib of self.attributes) {
                    if (attrib.chartId === undefined) {
                        attrib.chartId = self.createId(0, 0);
                    }
                }
            })
        }]
    });