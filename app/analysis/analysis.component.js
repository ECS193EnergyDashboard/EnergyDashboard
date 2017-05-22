angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        webIds:     '<',
        elemName:   '<', // passed to columnTemplate component to determine template type
        onStartLoad:'&',
        onEndLoad:  '&'
    },
    controller: ['$filter', '$scope', 'pi',
        function AnalysisController($filter,$scope, pi) {
            var self = this;
            this.sums = {};
            this.averages = {};
            this.maxAndMin = {};
            this.currentFormattingSettingsCol = {};  //Current col for CF settings
            this.showFormattingSettingsButtons = true;
            this.datePicker = {};
            this.datePicker.date = {
                startDate: moment().startOf('day'),
                endDate: moment()
            };
            this.DRPOptions = {
                "showDropdowns": true,
                "timePicker": true,
                "timePickerIncrement": 15,
                "autoApply": true,
                "ranges": {
                    "Today": [
                        moment().startOf('day'), moment()
                    ],
                    "Past 24 Hours": [
                        moment().subtract(1, 'days'),
                        moment()
                    ],
                    "Last 7 Days": [
                        moment().subtract(7, 'days'),
                        moment()
                    ],
                    "Past Month": [
                        moment().subtract(1, 'months'),
                        moment()
                    ],
                    "Past Year": [
                        moment().subtract(1, 'years'),
                        moment()
                    ]
                }
            }
            this.data = [];

            this.outerColumnNames = [];
            this.innerColumnNames = [
                {
                    name: "Average",
                    isChecked: true
                }, {
                    name: "Maximum",
                    isChecked: true
                }, {
                    name: "Minimum",
                    isChecked: true
                }, {
                    name: "StdDev",
                    isChecked: true
                }
            ];

            this.startAnalysis = function() {
                this.onStartLoad();

                var startDate = self.datePicker.date.startDate.format();
                var endDate = self.datePicker.date.endDate.format();
                pi.getSummaryOfElements(this.webIds, startDate, endDate).then(function(response) {
                    var data = [];

                    for (var element of response) {
                        var values = [];
                        for (var value of element.values) {
                            if (value.values) {
                                values.push(pi.tabulateValues(value));
                            }
                        }
                        element.values = values;
                        data.push(pi.tabulateValues(element));
                    }

                    self.data = data;

                    console.log(self.data);

                    var colNames = [];
                    var columnSet = {};

                    for (var element of self.data) {
                        for (var key in element) {
                            if (key !== "name" && key !== "building") {
                                columnSet[key] = true;
                            }
                        }
                    }


                    var firstValues = 0;
                    for (var element of Object.keys(columnSet)) {
                        var column = {};
                        column.name = element;

                        if (firstValues < 10) {
                            column.isChecked = true;
                        } else {
                            column.isChecked = false;
                        }
                        colNames.push(column);
                        firstValues++;
                    }

                    self.outerColumnNames = colNames;
                    console.log(self.outerColumnNames);

                    self.onEndLoad();
                });
            };

            this.getters = {
                value: function(outerName, innerName, element) {
                    return element[outerName][innerName].value;
                }
            };

            this.formatValue = function(value) {
                if (value === undefined) {
                    return "N/A";
                } else if (value.good && typeof(value.value) === "number") {
                    return $filter('number')(value.value, 2);
                } else {
                    return "ERROR";
                }
            };

            this.valueStyle = function(value) {
                if (value === undefined) {
                    return 'missingValue';
                } else if (value.good) {
                    return 'goodValue';
                } else {
                    return 'badValue';
                }
            }

            // Callback for column-template-dropdown component
            this.updateCol = function(cols) {
                this.outerColumnNames = cols;
            }


            this.updateCalculations = function() {
                this.sums = {};
                this.averages = {};
                this.maxAndMin = {};
                for (var column of this.data) {
                    this.sums[column.name] = this.sumColumn(column.name);
                    this.averages[column.name] = this.averageColumn(column.name);
                    this.maxAndMin[column.name] = this.maxMinColumn(column.name);
                }
            };

            this.sumColumn = function(columnName) {
                var acc = this.reduceColumn(columnName, { sum: 0 }, function(val, acc) { acc.sum += val; });
                return acc.sum;
            };

            this.averageColumn = function(columnName) {
                var acc = this.reduceColumn(columnName, { sum: 0, len: 0 }, function(val, acc) {
                    acc.sum += val;
                    acc.len++;
                });
                return acc.len > 0 ? acc.sum / acc.len : 0;
            };

            this.maxMinColumn = function(columnName){
                var acc = this.reduceColumn(columnName, {max: null, min: null}, function(val, acc){
                    if(acc.max == null){
                        acc.max = val;
                    }
                    else if(val > acc.max){
                        acc.max = val;
                    }

                    if(acc.min == null){
                        acc.min = val;
                    }
                    else if(val < acc.min){
                        acc.min = val;
                    }
                });
                return acc;
            }

            // For every currently displayed row in column 'columnName', applies the function 'opFunc' to the cell's value and the accumulator object 'accumulator'.
            // Returns the accumulated value object.
            this.reduceColumn = function(columnName, accumulator, opFunc) {
                var a = accumulator;
                for (var element of this.data) {
                    var colVal = element[columnName];
                    if (colVal && colVal.good && colVal.value != undefined) {
                        opFunc(colVal.value, a);
                    }
                }
                return a;
            };

            $scope.$watch('$ctrl.data', function(newValue, oldValue) {
                self.updateCalculations();
            });


        }
    ]
});
