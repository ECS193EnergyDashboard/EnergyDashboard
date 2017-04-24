angular.module('chartOptionsModule').component('chartOptions', {
        templateUrl: 'chart-options/chart-options.template.html',
        bindings: {
            attributes: '<'
        },
        controller: [ '$window',  '$scope', function($window, $scope) {
            var self = this;

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

                if (this.title) {
                    url += 'title='+ this.title + '&';
                }

                if (this.yAxisName) {
                    url += 'yAxis='+ this.yAxisName + '&';
                }

                if (this.attributes) {
                    for (var attrib of this.attributes) {
                        url += 'webIdA' + attrib.axis + '=' + attrib.webId + '&';
                    }
                }

                $window.open(url);
            }

            $scope.$watchCollection('$ctrl.attributes', function() {
                for (var attrib of self.attributes) {
                    if (attrib.axis === undefined) {
                        attrib.axis = 1;
                    }
                }
            })
        }]
    });