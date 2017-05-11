nv.models.multiLineChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
        var margin = {top: 30, right: 20, bottom: 50, left: 60},
            width = null,
            height = null,
            x = function(d) { return d.x },
            y = function(d) { return d.y},
            duration = 250,
            interactiveLayer = nv.interactiveGuideline(),
            legendRightAxisHint = ' (right axis)'
            ;

    //============================================================
    // Private Variables
    //------------------------------------------------------------

        var xScale = d3.scale.linear(),
            yScale1 = d3.scale.linear(),
            yScale2 = d3.scale.linear(),

            xAxis = nv.models.axis().scale(xScale).orient('bottom').tickPadding(5).duration(duration).showMaxMin(false),
            yAxis1 = nv.models.axis().scale(yScale1).orient('left').duration(duration),
            yAxis2 = nv.models.axis().scale(yScale2).orient('right').duration(duration),

            tooltip = nv.models.tooltip(),
            dispatch = d3.dispatch(),

            color = nv.utils.defaultColor(),

            brushExtent = null;


        var lines = [];
        var legends = [];
        var enabled = [];

    function setAxis(axis, a) {
        axis
            .axisLabel(a.axisLabel())
            .tickFormat(a.tickFormat())
            .showMaxMin(a.showMaxMin());
    }

    function chart(selection, rebuildDom) {
        selection.each(function(dataset) {

            var container = d3.select(this);
            nv.utils.initSVG(container);

            chart.update = function(rebuildDom) { container.transition().call(chart, rebuildDom); };
            chart.container = this;

            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = height * dataset.length + margin.top + margin.bottom;

            container.style('height', availableHeight);
            container.attr('height', availableHeight);

            if (rebuildDom) {
                container.selectAll('svg > *').remove();
            }

            var wrap = container.selectAll('g.wrap.multiLineChart').data([dataset]);
            var gEnter = wrap.enter().append('g').attr('class', 'wrap nvd3 multiLineChart').append('g');
            var g = wrap.select('g');
            g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var flatData = d3.merge(dataset);
            var colorArray = flatData.map(function(d,i) {
                return flatData[i].color || color(d, i);
            })
            var colorIndex = 0;

            tooltip
                .duration(0)
                .hideDelay(0)
                .hidden(false)
                .headerFormatter(xAxis.tickFormat())
                .valueFormatter(yAxis1.tickFormat());

            var values = flatData[0].values;
            if (brushExtent) {
                values = values.filter(function(d,i) {
                    if(brushExtent[0] <= brushExtent[1]) {
                        return x(d,i) >= brushExtent[0] && x(d,i) <= brushExtent[1];
                    } else {
                        return x(d,i) >= brushExtent[1] && x(d,i) <= brushExtent[0];
                    }
                });
            }

            xScale.domain(d3.extent(values, function(d) { return d.timestamp; })).range([0, availableWidth]);

            var linesWidth = Math.floor(availableWidth * 0.8);
            var legendWidth = availableWidth - linesWidth;

            var lineYPosition = 0;

            dataset.forEach(function(data, index) {
                if (lines[index] === undefined) {
                    lines[index] = nv.models.multiAxisLineChart();
                    enabled[index] = true;
                }

                var checkboxWrap = gEnter.append('g').attr('class', 'buttonWrap' + index)
                    .attr('transform', 'translate(' + -margin.left / 2 + ',' + (lineYPosition) + ')')

                
                var checkbox = checkboxWrap.append('rect')
                    .attr('width', 10)
                    .attr('height', 10)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)
                    .attr('fill', 'transparent');

                if (enabled[index]) {
                    var checkboxFill = checkboxWrap.append('rect')
                        .attr('width', 6)
                        .attr('height', 6)
                        .attr('rx', 2)
                        .attr('ry', 2)
                        .attr('fill', 'black')
                        .attr('transform', 'translate(2, 2)');
                }

                checkbox.on('click', function() { 
                    enabled[index] = !enabled[index];
                    chart.update(true);
                });

                if (enabled[index]) {
                    var line = lines[index];

                    line
                        .width(linesWidth)
                        .height(height)
                        .margin({ top: 20, bottom: 20, left: 0, right: 0 })
                        .x(x)
                        .y(y)
                        .useInteractiveGuideline(true)
                        .showLegend(false);

                    line.interactiveLayer.tooltip.enabled(false);

                    line.color(colorArray.slice(colorIndex, colorIndex + data.length))
                    colorIndex += data.length;

                    setAxis(line.xAxis, xAxis);
                    setAxis(line.yAxis1, yAxis1);
                    setAxis(line.yAxis2, yAxis2);

                    var lineWrap = gEnter.append('g').attr('class', 'lineWrap' + index);

                    lineWrap
                        .attr('transform', 'translate(0,' + lineYPosition + ')')
                        .datum(data.filter(function(d){return !d.disabled}))
                        .call(line);

                    if (line.api.updateExtent) {
                        line.api.updateExtent(brushExtent);
                    }

                    lineYPosition += height;
                } else {
                    var lineWrap = gEnter.append('g').attr('class', 'lineWrap' + index);
                    var x1 = -margin.left / 2 + 20;
                    var x2 = x1 + linesWidth;
                    var y1 = lineYPosition + 5;
                    var y2 = y1;

                    var line = lineWrap.append('line')
                        .attr('x1', x1)
                        .attr('y1', y1)
                        .attr('x2', x2)
                        .attr('y2', y2)
                        .attr('stroke-width', 2)
                        .attr('stroke', 'black');

                    lineYPosition += 20;
                }
            });

            gEnter.append('g').attr('class', 'nv-interactive');

            interactiveLayer
                .width(availableWidth)
                .height(availableHeight)
                .margin({left:margin.left, top:margin.top})
                .svgContainer(container)
                .xScale(xScale);
            wrap.select(".nv-interactive").call(interactiveLayer);

            interactiveLayer.dispatch.on('elementMousemove', function(e) {
                tooltip.hidden(true);
                var tooltipData = { series: [] };
                lines.forEach(function(line, index) {
                    if (enabled[index] && line.api.showGuidelineAt && line.api.getDataAt) {
                        line.api.showGuidelineAt(e.pointXValue);
                        var guideData = line.api.getDataAt(e.pointXValue);
                        tooltipData.value = guideData.xValue;
                        tooltipData.series = tooltipData.series.concat(guideData.series);
                    }
                });
                tooltip.hidden(false).data(tooltipData);
            })

            interactiveLayer.dispatch.on('elementMouseout', function(e) {
                for (var line of lines) {
                    if (line.api.hideGuideline) {
                        line.api.hideGuideline();
                    }
                }
                tooltip.hidden(true);
            })

            var legendYPosition = 0;
            var colorIndex = 0;

            lines.forEach(function(line, index) {
                if (legends[index] === undefined) {
                    legends[index] = nv.models.legend();
                }
                var legend = legends[index];

                if (enabled[index]) {

                    var legendWrap = gEnter.append('g').attr('class', 'legendWrap' + index);
                    
                    var legendXPosition = linesWidth + margin.right;

                    var data = dataset[index];

                    legend.width(legendWidth);
                    legend.color(colorArray.slice(colorIndex, colorIndex + data.length));
                    colorIndex += data.length;

                    legendWrap
                        .datum(data.map(function(series) {
                            series.originalKey = series.originalKey === undefined ? series.key : series.originalKey;
                            series.key = series.originalKey + (series.yAxis == 1 ? '' : legendRightAxisHint);
                            return series;
                        }))
                        .call(legend);

                    legendWrap
                        .attr('transform', 'translate(' + legendXPosition + ',' + legendYPosition + ')');

                    legend.dispatch.on('stateChange', function(newState) {
                        line.update();
                    });

                    legendYPosition += legend.height() + 10;

                }

            });

        });

        return chart;
    }

    //============================================================
    // Global getters and setters
    //------------------------------------------------------------

    chart.xAxis = xAxis;
    chart.yAxis1 = yAxis1;
    chart.yAxis2 = yAxis2;
    chart.interactiveLayer = interactiveLayer;

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        width:      {get: function(){return width;}, set: function(_){width=_;}},
        height:     {get: function(){return height;}, set: function(_){height=_;}},
        x:      {get: function(){return x;}, set: function(_){x=_;}},
        y:     {get: function(){return y;}, set: function(_){y=_;}},
        duration:     {get: function(){return duration;}, set: function(_){duration=_;}},
        brushExtent:     {get: function(){return brushExtent;}, set: function(_){brushExtent=_;}},
        legendRightAxisHint:    {get: function(){return legendRightAxisHint;}, set: function(_){legendRightAxisHint=_;}},
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top  !== undefined ? _.top  : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }}
    });

    nv.utils.initOptions(chart);

    return chart;
};