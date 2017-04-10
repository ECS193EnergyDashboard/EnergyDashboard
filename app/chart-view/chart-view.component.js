angular.module('chartViewModule').component('chartView', {
        templateUrl: 'chart-view/chart-view.template.html',
        bindings: {
            interval: '<',
            webIds: '<'
        },
        controller: [ 'pi', '$q', function(pi, $q) {
            var self = this;

            this.options = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d){ return d.timestamp; },
                    y: function(d){ return d.value; },
                    interpolate: 'linear',
                    useInteractiveGuideline: true, // if false use tooltipContent
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat: function(d) {
                            return d3.time.format('%m/%d %H:%M')(new Date(d));
                        }
                    },
                    yAxis: {
                        axisLabel: 'Example Y-Axis',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    },
                    tooltip: {
                        contentGenerator: function(e) {
                            return "(" + e.point.x + " " + e.point.y + ")";
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Title'
                }
            };

            this.$onInit = function() {
                this.generateChart();
            }

            this.generateChart = function() {
                this.data = [];
                var promises = [];

                for (var i = 0; i < this.webIds.length; i++) {
                    this.data[i] = {
                        values: [],
                        key: ''
                    }

                    var webId = this.webIds[i];
                    promises.push(pi.getInterpolatedOfAttribute(webId, this.interval));
                    promises.push(pi.getAttributeName(webId));
                    promises.push(pi.getAttributeParentElement(webId));
                }

                $q.all(promises).then(function(responses) {
                    for (var i = 0; i < responses.length; i++) {
                        var idx = i * 3;
                        self.data[i].values = responses[idx];
                        var name = responses[idx + 1];
                        var parent = responses[idx + 2];
                        self.data[i].key = parent.building + ": " + parent.name + " | " + name; 
                    }
                });
            };
        }]
    });