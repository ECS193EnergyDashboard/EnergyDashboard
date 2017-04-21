angular.module('testChartModule', [ 'nvd3', 'core' ])
    .component('testChart', {
        templateUrl: 'test-chart/test-chart.template.html',
        controller: [ 'pi', function(pi) {
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
                    dispatch: {
                        stateChange: function(e){ console.log("stateChange"); },
                        changeState: function(e){ console.log("changeState"); },
                        tooltipShow: function(e){ console.log("tooltipShow"); },
                        tooltipHide: function(e){ console.log("tooltipHide"); }
                    },
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat: function(d) {
                            return d3.time.format('%m/%d %H:%M')(new Date(d));
                        }
                    },
                    yAxis: {
                        axisLabel: 'Room Temperature (F)',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    },
                    callback: function(chart){
                        console.log("!!! lineChart callback !!!");
                    },
                    tooltip: {
                        contentGenerator: function(e) {
                            return "(" + e.point.x + " " + e.point.y + ")";
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Title for Line Chart'
                }
            };

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

            this.generateChart = function() {
                this.data = [
                    { 
                        values: [],
                        key: 'RM1105',
                        color: '#ff7f0e'
                    },
                    { 
                        values: [],
                        key: 'RM1113',
                        color: '#7777ff'
                    }
                ];
                
                var interval = this.interval + this.intervalUnits.value;

                var webId = 'A0EbgZy4oKQ9kiBiZJTW7eugwHdna_ulm5RGZEkhRt5d2AAtcc10jH-8VwVqDxQC6NjdAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAxXFJNMTEwNXxST09NIFRFTVBFUkFUVVJF';

                pi.getInterpolatedOfAttribute(webId, interval).then(function(response) {
                    self.data[0].values = response;
                });

                var webId = 'A0EbgZy4oKQ9kiBiZJTW7eugwI9na_ulm5RGZEkhRt5d2AAi8c10jH-8VwVqDxQC6NjdAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAxXFJNMTExM3xST09NIFRFTVBFUkFUVVJF';

                pi.getInterpolatedOfAttribute(webId, interval).then(function(response) {
                    self.data[1].values = response;
                });
            };

            this.generateChart();
        }]
    });