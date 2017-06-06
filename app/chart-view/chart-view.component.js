angular.module('chartViewModule').component('chartView', {
        templateUrl: 'chart-view/chart-view.template.html',
        controller: [ 'pi', '$q', '$location', '$window', '$scope', function(pi, $q, $location, $window, $scope) {
            var self = this;

            this.isLoading = false;
            this.dataset = [];
            this.datasetFlat = [];
            
            var charts = [];
            var focus = undefined;

            var collectAttributes = function(params) {
                var attributes = [];
                var numCharts = params.charts;
                if (!numCharts) {
                    return [];
                }
                for (var chart = 0; chart < numCharts; chart++) {
                    attributes[chart] = [];
                    for (var axis = 0; axis <= 1; axis++) {
                        var param = params['webIdC' + chart + 'A' + axis];
                        var webIds = Array.isArray(param) ? param : param ? [ param ] : [];
                        if (webIds) {
                            for (var id of webIds) {
                                attributes[chart].push({ webId: id, chart: chart, axis: axis });
                            }
                        }
                    }
                }

                return attributes;
            }
            
            var urlParams = $location.search();

            this.config = {
                attributes: collectAttributes(urlParams),
                interval: urlParams.interval,
                startTime: urlParams.start,
                endTime: urlParams.end
            };

            var xTickFormat = function(time) {
                return d3.time.format('%m/%d %H:%M')(new Date(time));
            }

            var yTickFormat = function(d) {
                return d3.format('.02f')(d);
            }

            var tooltipValueFormat = function(d) {
                return d === null ? 'Bad' : yTickFormat(d);
            }

            $scope.$on('angular-resizable.resizing', function(event, args) {
                if (args.height) {
                    var index = event.targetScope.$parent.$index;
                    var chart = charts[index];
                    if (args.height <= 10 && !chart.disabled) {
                        $scope.$apply(function() {
                            chart.disabled = true;
                            chart.closedByDragging = true;
                        });
                    } else {
                        chart.height(args.height);
                        chart.update();
                    }
                }
            });

            var graphWidth = $window.innerWidth;
            var lrMargin = 80;

            $window.onresize = function(e) {
                var width = $window.innerWidth;
                var svg = $('svg.nvd3-svg');
                svg.css('width', width);
                svg.attr('width', width);
                focus.width(innerWidth);
                for (var chart of charts) {
                    chart.width(width);
                }
            };

            var tooltipContentGenerator = function(d, elem) {
                    if (d === null) {
                        return '';
                    }

                    var table = d3.select(document.createElement("table"));
                    var theadEnter = table.selectAll("thead")
                        .data([d])
                        .enter().append("thead");

                    theadEnter.append("tr")
                        .append("td")
                        .attr("colspan", 3)
                        .append("strong")
                        .classed("x-value", true)
                        .html(xTickFormat(d.value));

                    var tbodyEnter = table.selectAll("tbody")
                        .data([d])
                        .enter().append("tbody");

                    var trowEnter = tbodyEnter.selectAll("tr")
                            .data(function(p) { return p.series })
                            .enter()
                            .append("tr")
                            .style('border-bottom', function(p) { return p === 'SEP' ? '1px solid rgba(0,0,0,0.2)' : 'none'; });

                    trowEnter.append("td")
                        .classed("legend-color-guide", function(p) { return p !== 'SEP'; })
                        .append("div")
                        .style("background-color", function(p) { return p.color});

                    trowEnter.append("td")
                        .classed("key",true)
                        .html(function(p, i) { return p.key });

                    trowEnter.append("td")
                        .classed("value",true)
                        .html(function(p, i) { return p === 'SEP' ? '' : tooltipValueFormat(p.value, i, p) });

                    var html = table.node().outerHTML;
                    if (d.footer !== undefined)
                        html += "<div class='footer'>" + d.footer + "</div>";
                    return html;

            };

            var tooltip = nv.models.tooltip()
                .duration(0)
                .hideDelay(0)
                .contentGenerator(tooltipContentGenerator);


            var onChartMouseMove = function(e) {
                var tooltipData = { series: [] };

                var filteredCharts = charts.filter(function(c) { return !c.disabled; });

                for (var chart of filteredCharts) {
                    chart.dispatch.onChartHover(e);

                    tooltipData.series = tooltipData.series.concat(chart.interactiveLayer.tooltip.data().series).concat('SEP');
                }
                tooltipData.series.pop();

                if (filteredCharts.length) {
                    tooltipData.value = filteredCharts[0].interactiveLayer.tooltip.data().value;
                }

                tooltip
                    .hidden(false)
                    .data(tooltipData)
                    ();
            }

            var onChartMouseOut = function(e) {
                var filteredCharts = charts.filter(function(c) { return !c.disabled; });
                for (var chart of filteredCharts) {
                    chart.dispatch.onChartHoverOut(e);
                }
                tooltip.hidden(true);
            }

            var setupChartColor = function() {
                var color = nv.utils.defaultColor();
                var colorArray = self.datasetFlat.map(function(d, i) {
                    return color(d, i);
                })
                var colorIdx = 0;
                for (var i = 0; i < charts.length; i++) {
                    var len = self.dataset[i].length;
                    charts[i].color(colorArray.slice(colorIdx, colorIdx + len));
                    colorIdx += len;
                }
            }

            this.isChartEnabled = function(index) {
                return charts[index] && !charts[index].disabled;
            }

            this.toggleChartEnabled = function(index) {
                var chart = charts[index];
                var disabled = !chart.disabled;
                chart.disabled = disabled;

                if (!disabled && chart.closedByDragging) {
                    chart.height(200);
                    chart.update();
                    $('#chart' + index).height(200);
                    chart.closedByDragging = false;
                }

                /*
                for (var series of this.dataset[index]) {
                    series.disabled = disabled;
                }
                */
            }

            this.buttonClass = function(index) {
                if (charts[index] && charts[index].disabled) {
                    return 'glyphicon glyphicon-eye-close';
                } else {
                    return 'glyphicon glyphicon-eye-open';
                }
            }


            this.onChartReady = function(scope, element) {
                var index = scope.$parent.$index;
                var chart = scope.chart;
                charts[index] = chart;
            }

            this.lineOptions = {
                chart: {
                    type: 'multiAxisLineChart',
                    height: 200,
                    width: graphWidth,
                    margin: {
                        top: 20,
                        bottom: 40,
                        right: lrMargin,
                        left: lrMargin
                    },
                    x: function(d) { return new Date(d.timestamp).getTime(); },
                    y: function(d) { return d.value; },
                    useInteractiveGuideline: true,
                    showXAxis: true,
                    xAxis: {
                        axisLabel: '',
                        tickFormat: xTickFormat
                    },
                    yAxis1: {
                        axisLabel: '',
                        tickFormat: yTickFormat,
                    },
                    yAxis2: {
                        axisLabel: '',
                        tickFormat: yTickFormat,
                    },
                    interactiveLayer: {
                        tooltip: {
                            enabled: false
                        },
                        dispatch: {
                            elementMousemove: onChartMouseMove,
                            elementMouseout: onChartMouseOut
                        }
                    },
                    legend: {
                        align: false,
                        keyFormatter: function(d) { return ''; },
                        margin: {
                            top: 2
                        }
                    }
                }
            };

            var onChangeFocus = function(extent) {
                for (var chart of charts) {
                    chart.dispatch.onBrush(extent);
                }
            }

            this.focusOptions = {
                chart: {
                    type: 'focus',
                    width: graphWidth,
                    height: 120,
                    margin: {
                        top: 40,
                        bottom: 40,
                        left: lrMargin,
                        right: lrMargin
                    },
                    x: function(d) { return d.timestamp; },
                    y: function(d) { return d.value; },
                    xAxis: {
                        tickFormat: xTickFormat,
                        rotateLabels: 0,
                    },
                    dispatch: {
                        onBrush: onChangeFocus,
                    },
                    callback: function(chart) {
                        focus = chart;
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

                this.numRequests = this.config.attributes.reduce(function(acc, attrib) {
                    return acc + attrib.length;
                }, 0);
                this.numRequestsDone = 0;

                this.dataset = [];
                var promises = [];
                
                var startTime = this.datePicker.date.startDate.format();
                var endTime = this.datePicker.date.endDate.format();

                var interval = this.interval + this.intervalUnits.value;

                $location.search('interval', interval);
                $location.search('start', startTime);
                $location.search('end', endTime);

                var chartMap = {};
                var idxMap = {};

                for (var chart = 0; chart < this.config.attributes.length; chart++) {
                    this.dataset[chart] = [];

                    for (var i = 0; i < this.config.attributes[chart].length; i++) {
                        var attrib = this.config.attributes[chart][i];
                        this.dataset[chart][i] = {
                            values: [],
                            key: '',
                            yAxis: attrib.axis + 1       
                        }

                        var idx = Math.floor(promises.length / 2);
                        chartMap[idx] = chart;
                        idxMap[idx] = i;

                        promises.push(pi.getAttribute(attrib.webId));
                        var promise = pi.getInterpolatedOfAttribute(attrib.webId, interval, startTime, endTime);
                        promises.push(promise);

                        promise.then(function(response) {
                            self.numRequestsDone++;
                        });
                    }
                }

                $q.all(promises).then(function(responses) {
                    for (var i = 0; i < responses.length - 1; i += 2) {
                        var attrib = responses[i];
                        var idx = Math.floor(i / 2);
                        var chart = chartMap[idx];
                        var attribIdx = idxMap[idx];

                        var series = self.dataset[chart][attribIdx];
                        series.values = replaceBadValues(responses[i + 1]);
                        series.key = attrib.element.building + ": " + attrib.element.name + " | " + attrib.name;
                    }

                    self.datasetFlat = d3.merge(self.dataset);
                    self.isLoading = false;

                    setupChartColor();
                });
            };

            this.fileName = 'Chart.csv';

            this.ShowDownloadModal = function(){
                $('#downloadModal').modal();
                console.log(this.datasetFlat[0]);
            }

            this.GetHeaderData = function() {
                var header = [ 'Attribute' ];
                if (this.datasetFlat.length > 0) {
                    for (var value of this.datasetFlat[0].values) {
                        header.push(xTickFormat(value.timestamp));
                    }
                }
                return header;
            };

            this.GetArrayData = function() {
                var csv = [];

                for (var data of this.datasetFlat) {
                    var obj = {};
                    obj['Attribute'] = data.key;
                    for (var value of data.values) {
                        var key = xTickFormat(value.timestamp);
                        obj[key] = value.value;
                    }
                    csv.push(obj);
                }
                
                return csv;
            }
        }]
    });