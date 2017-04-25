nv.models.multiAxisLineChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 30, right: 20, bottom: 50, left: 60},
        marginTop = null,
        color = nv.utils.defaultColor(),
        width = null,
        height = null,
        showLegend = true,
        noData = null,
        yDomain1,
        yDomain2,
        getX = function(d) { return d.x },
        getY = function(d) { return d.y},
        interpolate = 'linear',
        useVoronoi = true,
        interactiveLayer = nv.interactiveGuideline(),
        useInteractiveGuideline = false,
        legendRightAxisHint = ' (right axis)',
        duration = 250,
        api = { }
        ;

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var x = d3.scale.linear(),
        yScale1 = d3.scale.linear(),
        yScale2 = d3.scale.linear(),

        // Clip edges so they don't pass x/y axes
        lines1 = nv.models.line().yScale(yScale1).duration(0).clipEdge(true),
        lines2 = nv.models.line().yScale(yScale2).duration(0).clipEdge(true),

        xAxis = nv.models.axis().scale(x).orient('bottom').tickPadding(5).duration(duration),
        yAxis1 = nv.models.axis().scale(yScale1).orient('left').duration(duration),
        yAxis2 = nv.models.axis().scale(yScale2).orient('right').duration(duration),

        legend = nv.models.legend().height(30),
        tooltip = nv.models.tooltip(),
        dispatch = d3.dispatch(),

        brushExtent = null;

    var charts = [lines1, lines2];

    function chart(selection) {
        selection.each(function(data) {
            var container = d3.select(this),
                that = this;
            nv.utils.initSVG(container);

            chart.update = function() { container.transition().call(chart); };
            chart.container = this;

            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = nv.utils.availableHeight(height, container, margin);

            var dataLines1 = data.filter(function(d) {return d.yAxis == 1});
            var dataLines2 = data.filter(function(d) {return d.yAxis == 2});

            // Display noData message if there's nothing to show.
            if (!data || !data.length || !data.filter(function(d) { return d.values.length }).length) {
                nv.utils.noData(chart, container);
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            var series1 = data.filter(function(d) {return !d.disabled && d.yAxis == 1})
                .map(function(d) {
                    return d.values.map(function(d,i) {
                        return { x: getX(d), y: getY(d) }
                    })
                });

            var series2 = data.filter(function(d) {return !d.disabled && d.yAxis == 2})
                .map(function(d) {
                    return d.values.map(function(d,i) {
                        return { x: getX(d), y: getY(d) }
                    })
                });

            x   .domain(d3.extent(d3.merge(series1.concat(series2)), function(d) { return d.x }))
                .range([0, availableWidth ]);

            var wrap = container.selectAll('g.wrap.multiAxisLineChart').data([data]);
            var gEnter = wrap.enter().append('g').attr('class', 'wrap nvd3 multiAxisLineChart').append('g');

            gEnter.append('g').attr('class', 'nv-x nv-axis');
            gEnter.append('g').attr('class', 'nv-y1 nv-axis');
            gEnter.append('g').attr('class', 'nv-y2 nv-axis');
            gEnter.append('g').attr('class', 'lines1Wrap');
            gEnter.append('g').attr('class', 'lines2Wrap');
            gEnter.append('g').attr('class', 'legendWrap');
            gEnter.append('g').attr('class', 'nv-interactive');

            var g = wrap.select('g');

            var color_array = data.map(function(d,i) {
                return data[i].color || color(d, i);
            });

            // Legend
            if (!showLegend) {
                g.select('.legendWrap').selectAll('*').remove();
            } else {
                var legendWidth = legend.align() ? availableWidth / 2 : availableWidth;
                var legendXPosition = legend.align() ? legendWidth : 0;

                legend.width(legendWidth);
                legend.color(color_array);

                g.select('.legendWrap')
                    .datum(data.map(function(series) {
                        series.originalKey = series.originalKey === undefined ? series.key : series.originalKey;
                        series.key = series.originalKey + (series.yAxis == 1 ? '' : legendRightAxisHint);
                        return series;
                    }))
                    .call(legend);

                if (!marginTop && legend.height() !== margin.top) {
                    margin.top = legend.height();
                    availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0);;
                }

                g.select('.legendWrap')
                    .attr('transform', 'translate(' + legendXPosition + ',' + (-margin.top) +')');
            }


            lines1
                .width(availableWidth)
                .height(availableHeight)
                .interpolate(interpolate)
                .color(color_array.filter(function(d,i) { return !data[i].disabled && data[i].yAxis == 1}));
            lines2
                .width(availableWidth)
                .height(availableHeight)
                .interpolate(interpolate)
                .color(color_array.filter(function(d,i) { return !data[i].disabled && data[i].yAxis == 2}));

            g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var lines1Wrap = g.select('.lines1Wrap')
                .datum(dataLines1.filter(function(d){return !d.disabled}));
            var lines2Wrap = g.select('.lines2Wrap')
                .datum(dataLines2.filter(function(d){return !d.disabled}));


            yScale1 .domain(yDomain1 || d3.extent(d3.merge(series1), function(d) { return d.y } ))
                .range([0, availableHeight]);

            yScale2 .domain(yDomain2 || d3.extent(d3.merge(series2), function(d) { return d.y } ))
                .range([0, availableHeight]);

            //if(dataLines1.length){d3.transition(lines1Wrap).call(lines1);}
            //if(dataLines2.length){d3.transition(lines2Wrap).call(lines2);}

            xAxis
                ._ticks( nv.utils.calcTicksX(availableWidth/100, data) )
                .tickSize(-availableHeight, 0);

            g.select('.nv-x.nv-axis')
                .attr('transform', 'translate(0,' + availableHeight + ')');

            /*
            d3.transition(g.select('.nv-x.nv-axis'))
                .call(xAxis);
            */

            yAxis1
                ._ticks( nv.utils.calcTicksY(availableHeight/36, data) )
                .tickSize( -availableWidth, 0);


            /*
            d3.transition(g.select('.nv-y1.nv-axis'))
                .call(yAxis1);
            */

            yAxis2
                ._ticks( nv.utils.calcTicksY(availableHeight/36, data) )
                .tickSize( -availableWidth, 0);

            /*
            d3.transition(g.select('.nv-y2.nv-axis'))
                .call(yAxis2);
            */

            g.select('.nv-y1.nv-axis')
                .classed('nv-disabled', series1.length ? false : true)
                .attr('transform', 'translate(' + x.range()[0] + ',0)');

            g.select('.nv-y2.nv-axis')
                .classed('nv-disabled', series2.length ? false : true)
                .attr('transform', 'translate(' + x.range()[1] + ',0)');

            legend.dispatch.on('stateChange', function(newState) {
                chart.update();
            });

            //============================================================
            // Update Axes
            //============================================================
            function updateXAxis() {
                d3.transition(g.select('.nv-x.nv-axis')).call(xAxis);
            }

            function updateYAxis() {
                d3.transition(g.select('.nv-y1.nv-axis')).call(yAxis1);
                d3.transition(g.select('.nv-y2.nv-axis')).call(yAxis2);
            }

            //============================================================
            // Update Focus
            //============================================================
            if (brushExtent === null) {
                lines1Wrap.call(lines1);
                lines2Wrap.call(lines2);
                updateXAxis();
                updateYAxis();
            } else {
                onBrush(brushExtent);
            }

            if(useInteractiveGuideline){
                interactiveLayer
                    .width(availableWidth)
                    .height(availableHeight)
                    .margin({left:margin.left, top:margin.top})
                    .svgContainer(container)
                    .xScale(x);
                wrap.select(".nv-interactive").call(interactiveLayer);
            }

            //============================================================
            // Event Handling/Dispatching
            //------------------------------------------------------------

            function mouseover_line(evt) {
                var yaxis = data[evt.seriesIndex].yAxis === 2 ? yAxis2 : yAxis1;
                evt.value = evt.point.x;
                evt.series = {
                    value: evt.point.y,
                    color: evt.point.color,
                    key: evt.series.key
                };
                tooltip
                    .duration(0)
                    .headerFormatter(function(d, i) {
                    	return xAxis.tickFormat()(d, i);
                    })
                    .valueFormatter(function(d, i) {
                        return yaxis.tickFormat()(d, i);
                    })
                    .data(evt)
                    .hidden(false);
            }

            function clearHighlights() {
              for(var i=0, il=charts.length; i < il; i++){
                var chart = charts[i];
                try {
                  chart.clearHighlights();
                } catch(e){}
              }
            }

            function highlightPoint(serieIndex, pointIndex, b){
              for(var i=0, il=charts.length; i < il; i++){
                var chart = charts[i];
                try {
                  chart.highlightPoint(serieIndex, pointIndex, b);
                } catch(e){}
              }
            }

            var getDataAt = function(pointXValue) {
                var allData = [], xValue;
                data
                .filter(function(series, i) {
                    return !series.disabled && !series.disableTooltip;
                })
                .forEach(function(series, i) {
                    var pointIndex = nv.interactiveBisect(series.values, pointXValue, chart.x());
                    var point = series.values[pointIndex];
                    xValue = chart.x()(point);
                    var pointYValue = chart.y()(point, pointIndex);

                    allData.push({
                        key: series.key,
                        value: pointYValue,
                        color: color(series,series.seriesIndex),
                        data: point,
                        yAxis: series.yAxis == 2 ? yAxis2 : yAxis1
                    });
                });

                return {
                    xValue: xValue,
                    series: allData
                };
            }

            var onElementMousemove = function(pointXValue) {
                clearHighlights();
                var singlePoint, pointIndex, pointXLocation, allData = [];
                data
                .filter(function(series, i) {
                    series.seriesIndex = i;
                    return !series.disabled && !series.disableTooltip;
                })
                .forEach(function(series,i) {
                    var extent = brushExtent !== null ? brushExtent : x.domain();
                    var currentValues = series.values.filter(function(d,i) {
                        //return chart.x()(d,i) >= extent[0] && chart.x()(d,i) <= extent[1];
                        if(extent[0] <= extent[1]) {
                            return chart.x()(d,i) >= extent[0] && chart.x()(d,i) <= extent[1];
                        } else {
                            return chart.x()(d,i) >= extent[1] && chart.x()(d,i) <= extent[0];
                        }
                    });

                    pointIndex = nv.interactiveBisect(currentValues, pointXValue, chart.x());
                    var point = currentValues[pointIndex];
                    var pointYValue = chart.y()(point, pointIndex);
                    if (pointYValue !== null) {
                        highlightPoint(i, pointIndex, true);
                    }
                    if (point === undefined) return;
                    if (singlePoint === undefined) singlePoint = point;
                    if (pointXLocation === undefined) pointXLocation = x(chart.x()(point,pointIndex));
                    allData.push({
                        key: series.key,
                        value: pointYValue,
                        color: color(series,series.seriesIndex),
                        data: point,
                        yAxis: series.yAxis == 2 ? yAxis2 : yAxis1
                    });
                });

                var defaultValueFormatter = function(d,i) {
                    var yAxis = allData[i].yAxis;
                    return d == null ? "N/A" : yAxis.tickFormat()(d);
                };

                interactiveLayer.tooltip
                    .headerFormatter(function(d, i) {
                        return xAxis.tickFormat()(d, i);
                    })
                    .valueFormatter(interactiveLayer.tooltip.valueFormatter() || defaultValueFormatter)
                    .data({
                        value: chart.x()( singlePoint,pointIndex ),
                        index: pointIndex,
                        series: allData
                    })();

                interactiveLayer.renderGuideLine(pointXLocation);
            }

            var onElementMouseout = function(e) {
                clearHighlights();
            }

            if(useInteractiveGuideline){
                interactiveLayer.dispatch.on('elementMousemove', function(e) { 
                    onElementMousemove(e.pointXValue);
                });

                interactiveLayer.dispatch.on("elementMouseout", onElementMouseout);
            } else {
                lines1.dispatch.on('elementMouseover.tooltip', mouseover_line);
                lines2.dispatch.on('elementMouseover.tooltip', mouseover_line);
                lines1.dispatch.on('elementMouseout.tooltip', function(evt) {
                    tooltip.hidden(true)
                });
                lines2.dispatch.on('elementMouseout.tooltip', function(evt) {
                    tooltip.hidden(true)
                });
            }

            function onBrush(extent) {
                // Update Main (Focus)
                var data1 = 
                    dataLines1.filter(function(d) { return !d.disabled; })
                        .map(function(d,i) {
                            return {
                                key: d.key,
                                axis: d.axis,
                                area: d.area,
                                classed: d.classed,
                                values: d.values.filter(function(d,i) {
                                    return lines1.x()(d,i) >= extent[0] && lines1.x()(d,i) <= extent[1];
                                }),
                                disableTooltip: d.disableTooltip
                            };
                        });
                var data2 =
                    dataLines2.filter(function(d) { return !d.disabled; })
                        .map(function(d,i) {
                            return {
                                key: d.key,
                                axis: d.axis,
                                area: d.area,
                                classed: d.classed,
                                values: d.values.filter(function(d,i) {
                                    return lines2.x()(d,i) >= extent[0] && lines2.x()(d,i) <= extent[1];
                                }),
                                disableTooltip: d.disableTooltip
                            };
                        });
                lines1Wrap.datum(data1).transition().duration(duration).call(lines1);
                lines2Wrap.datum(data2).transition().duration(duration).call(lines2);

                var series1 = data1.filter(function(d) {return !d.disabled})
                    .map(function(d) {
                        return d.values.map(function(d,i) {
                            return { x: getX(d), y: getY(d) }
                        })
                    });

                var series2 = data2.filter(function(d) {return !d.disabled})
                    .map(function(d) {
                        return d.values.map(function(d,i) {
                            return { x: getX(d), y: getY(d) }
                        })
                    });

                x.domain(d3.extent(d3.merge(series1.concat(series2)), function(d) { return d.x }));

                // Update Main (Focus) Axes
                updateXAxis();
                updateYAxis();
            }

            api.updateExtent = function(extent) {
                brushExtent = extent === null ? x.domain() : extent;
                onBrush(extent);
            }

            api.showGuidelineAt = onElementMousemove;
            api.hideGuideline = onElementMouseout;
            api.getDataAt = getDataAt;
        });

        return chart;
    }

    //============================================================
    // Global getters and setters
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.legend = legend;
    chart.lines1 = lines1;
    chart.lines2 = lines2;
    chart.xAxis = xAxis;
    chart.yAxis1 = yAxis1;
    chart.yAxis2 = yAxis2;
    chart.tooltip = tooltip;
    chart.interactiveLayer = interactiveLayer;
    chart.api = api;

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:      {get: function(){return width;}, set: function(_){width=_;}},
        height:     {get: function(){return height;}, set: function(_){height=_;}},
        showLegend: {get: function(){return showLegend;}, set: function(_){showLegend=_;}},
        yDomain1:      {get: function(){return yDomain1;}, set: function(_){yDomain1=_;}},
        yDomain2:    {get: function(){return yDomain2;}, set: function(_){yDomain2=_;}},
        noData:    {get: function(){return noData;}, set: function(_){noData=_;}},
        interpolate:    {get: function(){return interpolate;}, set: function(_){interpolate=_;}},
        legendRightAxisHint:    {get: function(){return legendRightAxisHint;}, set: function(_){legendRightAxisHint=_;}},

        // options that require extra logic in the 
        margin: {get: function(){return margin;}, set: function(_){
            if (_.top !== undefined) {
                margin.top = _.top;
                marginTop = _.top;
            }
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }},
        x: {get: function(){return getX;}, set: function(_){
            getX = _;
            lines1.x(_);
            lines2.x(_);
        }},
        y: {get: function(){return getY;}, set: function(_){
            getY = _;
            lines1.y(_);
            lines2.y(_);
        }},
        useVoronoi: {get: function(){return useVoronoi;}, set: function(_){
            useVoronoi=_;
            lines1.useVoronoi(_);
            lines2.useVoronoi(_);
        }},

        useInteractiveGuideline: {get: function(){return useInteractiveGuideline;}, set: function(_){
            useInteractiveGuideline = _;
            if (useInteractiveGuideline) {
                lines1.interactive(false);
                lines1.useVoronoi(false);
                lines2.interactive(false);
                lines2.useVoronoi(false);
            }
        }},

        duration: {get: function(){return duration;}, set: function(_) {
            duration = _;
            [lines1, lines2].forEach(function(model){
              model.duration(duration);
            });
        }}
    });

    nv.utils.initOptions(chart);

    return chart;
};