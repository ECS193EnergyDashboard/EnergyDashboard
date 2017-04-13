angular.module('chartViewModule').component('chartView', {
        templateUrl: 'chart-view/chart-view.template.html',
        bindings: {
            config: '<'
        },
        controller: [ 'pi', '$q', function(pi, $q) {
            var self = this;

            this.options = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 40,
                        bottom: 40,
                        left: 80
                    },
                    x: function(d) { return d.timestamp; },
                    y: function(d) { return d.value; },
                    interpolate: 'linear',
                    useInteractiveGuideline: true, // if false use tooltipContent
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat: function(d) {
                            return d3.time.format('%m/%d %H:%M')(new Date(d));
                        }
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: 10
                    },
                    tooltip: {
                        contentGenerator: function(e) {
                            return "(" + e.point.x + " " + e.point.y + ")";
                        }
                    }
                },
                title: {
                    enable: true,
                    text: ''
                }
            };

            this.$onInit = function() {
                if (this.config.yAxisName) {
                    this.options.chart.yAxis.axisLabel = this.config.yAxisName;
                }
                if (this.config.title) {
                    this.options.title.text = this.config.title;
                } else if (this.config.yAxisName) {
                    this.options.title.text = this.config.yAxisName + ' vs ' + this.options.chart.xAxis.axisLabel;
                }
                this.generateChart();
            }

            this.generateChart = function() {
                this.data = [];
                var promises = [];

                for (var i = 0; i < this.config.webIds.length; i++) {
                    this.data[i] = {
                        values: [],
                        key: ''
                    }

                    var webId = this.config.webIds[i];
                    promises.push(pi.getAttribute(webId));
                    promises.push(pi.getInterpolatedOfAttribute(webId, this.config.interval));
                }

                $q.all(promises).then(function(responses) {
                    for (var i = 0; i < self.data.length; i++) {
                        var idx = i * 2;
                        var attrib = responses[idx];
                        self.data[i].values = responses[idx + 1];
                        self.data[i].key = attrib.element.building + ": " + attrib.element.name + " | " + attrib.name; 
                    }
                });
            };
        }]
    });