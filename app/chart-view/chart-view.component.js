angular.module('chartViewModule').component('chartView', {
        templateUrl: 'chart-view/chart-view.template.html',
        controller: [ 'pi', '$q', '$location', function(pi, $q, $location) {
            var self = this;

            this.isLoading = false;
            this.data = [];

            var collectAttributes = function(params) {
                var attributes = [];
                for (var i = 1; i <= 2; i++) {
                    var param = params['webIdA' + i];
                    var webIds = Array.isArray(param) ? param : param ? [ param ] : [];
                    if (webIds) {
                        for (var id of webIds) {
                            attributes.push({ webId: id, axis: i });
                        }
                    }
                }
                return attributes;
            }
            
            var urlParams = $location.search();

            this.config = {
                attributes: collectAttributes(urlParams),
                yAxisName: urlParams.yAxis,
                title: urlParams.title,
                interval: urlParams.interval,
                startTime: urlParams.start,
                endTime: urlParams.end
            };

            var charts = [];

            var xTickFormat = function(time) {
                return d3.time.format('%m/%d %H:%M')(new Date(time));
            }

            var yTickFormat = function(d) {
                return d3.format('.02f')(d);
            }

            var tooltipValueFormat = function(d) {
                return d === null ? 'Bad' : yTickFormat(d);
            }

            var tooltip = nv.models.tooltip()
                .duration(0)
                .hideDelay(0)
                .hidden(false)
                .headerFormatter(xTickFormat)
                .valueFormatter(yTickFormat);

            var showGuideline = function(x) {
                var tooltipData = { series: [] };
                for (var chart of charts) {
                    chart.api.showGuidelineAt(x);
                    var guideData = chart.api.getDataAt(x);
                    tooltipData.value = guideData.xValue;
                    tooltipData.series = tooltipData.series.concat(guideData.series);
                }
                tooltip.hidden(false).data(tooltipData);
            }

            var hideGuideline = function() {
                for (var chart of charts) {
                    chart.api.hideGuideline();
                }
                tooltip.hidden(true);
            }

            this.lineConfig = {
                visible: true,
                disabled: true
            }

            this.lineOptions = {
                chart: {
                    type: 'multiAxisLineChart',
                    //showLegend: false,
                    height: 200,
                    width: 960,
                    margin: {
                        top: 20,
                        right: 40,
                        bottom: 40,
                        left: 80
                    },
                    x: function(d) { return new Date(d.timestamp).getTime(); },
                    y: function(d) { return d.value; },
                    useInteractiveGuideline: true, // if false use tooltipContent
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat: xTickFormat
                    },
                    yAxis1: {
                        axisLabel: '',
                        tickFormat: yTickFormat,
                        axisLabelDistance: 10
                    },
                    yAxis2: {
                        axisLabel: '',
                        tickFormat: yTickFormat,
                        axisLabelDistance: 10
                    },
                    interactiveLayer: {
                        tooltip: {
                            enabled: false
                        },
                        dispatch: {
                            elementMousemove: function(e) {
                                showGuideline(e.pointXValue);
                            },
                            elementMouseout: hideGuideline
                        }
                    },
                    callback: function(chart) {
                        charts.push(chart);
                    }
                },
                title: {
                    enable: true,
                    text: ''
                }
            };

            var onChangeFocus = function(extent) {
                for (var chart of charts) {
                    if (chart.api.updateExtent) {
                        chart.api.updateExtent(extent);
                    }
                }          
            }

            this.focusConfig = {
                visible: true,
                disabled: true
            }

            this.focusOptions = {
                chart: {
                    type: 'focus',
                    width: 900,
                    margin: {
                        top: 20,
                        bottom: 20,
                        left: 30 + 80,
                        right: 30
                    },
                    x: function(d) { return d.timestamp; },
                    y: function(d) { return d.value; },
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat: xTickFormat
                    },
                    dispatch: {
                        onBrush: onChangeFocus,
                    }
                }
            };

    
            this.datePicker = {};
            if (this.config.startTime && this.config.endTime) {
                this.datePicker.date = {
                    startDate: moment(this.config.startTime),
                    endDate: moment(this.config.endTime)
                };
            } else {
                this.datePicker.date = {
                    startDate: moment().subtract(1, 'days'),
                    endDate: moment()
                };
            }
            this.DRPOptions = {
                "showDropdowns": true,
                "timePicker": true,
                "timePickerIncrement": 15,
                "autoApply": true,
                "ranges": {
                    "Past 24 Hours": [
                        moment().subtract(1, 'days'), moment()
                    ],
                    "Last 7 Days": [
                        moment().subtract(7, 'days'), moment()
                    ],
                    "Past Month": [
                        moment().subtract(1, 'months'),  moment()
                    ],
                    "Past Year": [moment().subtract(1, 'years'), moment()]
                }
            }

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

            if (this.config.interval) {
                var match = /([0-9]+)([a-z]+)/.exec(this.config.interval);
                this.interval = match[1]
                for (var option of this.intervalOptions) {
                    if (option.value === match[2]) {
                        this.intervalUnits = option;
                        break;
                    }
                }     
            } else {
                this.interval = 1;
                this.intervalUnits = this.intervalOptions[1];
            }

            this.$onInit = function() {
                if (this.config.yAxisName) {
                    this.d3options.chart.yAxis.axisLabel = this.config.yAxisName;
                }
                if (this.config.title) {
                    this.d3options.title.text = this.config.title;
                } else if (this.config.yAxisName) {
                    this.d3options.title.text = this.config.yAxisName + ' vs ' + this.d3options.chart.xAxis.axisLabel;
                }
                this.generateChart();
            }

            this.numRequests = 0;
            this.numRequestsDone = 0;

            this.getProgress = function() {
                return (this.numRequestsDone / this.numRequests) * 100;
            }

            var replaceBadValues = function(values) {
                return values.map(function(v) {
                    if (!v.good) {
                        v.value = null;
                    }
                    return v;
                });
            }

            this.generateChart = function() {
                this.isLoading = true;
                this.numRequests = this.config.attributes.length;
                this.numRequestsDone = 0;

                this.data = [];
                var promises = [];
                
                var startTime = this.datePicker.date.startDate.format();
                var endTime = this.datePicker.date.endDate.format();

                var interval = this.interval + this.intervalUnits.value;

                $location.search('interval', interval);
                $location.search('start', startTime);
                $location.search('end', endTime);

                for (var i = 0; i < this.config.attributes.length; i++) {
                    this.data[i] = {
                        values: [],
                        key: '',
                        yAxis: this.config.attributes[i].axis
                    }

                    var webId = this.config.attributes[i].webId;
                    promises.push(pi.getAttribute(webId));
                    var promise = pi.getInterpolatedOfAttribute(webId, interval, startTime, endTime);
                    promises.push(promise);

                    promise.then(function(response) {
                        self.numRequestsDone++;
                    });
                }

                $q.all(promises).then(function(responses) {
                    for (var i = 0; i < self.data.length; i++) {
                        var idx = i * 2;
                        var attrib = responses[idx];
                        self.data[i].values = replaceBadValues(responses[idx + 1]);
                        self.data[i].key = attrib.element.building + ": " + attrib.element.name + " | " + attrib.name; 
                    }
                    self.isLoading = false;
                    self.lineConfig.disabled = false;
                    self.focusConfig.disabled = false;
                });
            };
        }]
    });