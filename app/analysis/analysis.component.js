angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        webIds:      '<',
        elemName:    '<', // passed to columnTemplate component to determine template type
        onStartLoad: '&',
        onEndLoad:   '&'
    },
    controller: ['$filter', '$scope', 'pi', 'conditionalFormatting', 'reduceColumn',
        function AnalysisController($filter, $scope, pi, cf, rc) { console.log(cf);
            var self = this;
            this.sums = {};
            this.averages = {};
            this.maxAndMin = {};
            this.currentFormattingSettingsCol = {}; //Current col for CF settings
            this.showFormattingSettingsButtons = true;
            $scope.cf = cf; //Give html access to cf service
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
            this.innerColumnNames = [{
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
            }];

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

            // Called in html to open the CF settings modal
            this.openCogModal = function(col) {
                this.currentFormattingSettingsCol = col;
                cf.showFormattingSettings(col, 'formattingSettingsModalAnalysis');
            }

            // Called in html to apply the CF settings
            this.submitFormattingSettings = function(col){
                col.max = document.getElementById("maxInputAnalysis").value;
                col.min = document.getElementById("minInputAnalysis").value;
                col.maxColor = document.getElementById("maxColorAnalysis").value;
                col.minColor = document.getElementById("minColorAnalysis").value;
                document.getElementById("conditionalFormatFormAnalysis").reset();
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


            /*this.updateCalculations = function() {
                this.sums = {};
                this.averages = {};
                this.maxAndMin = {};
                for (var column of this.data) {
                    this.sums[column.name] = this.sumColumn(column.name);
                    this.averages[column.name] = this.averageColumn(column.name);
                    this.maxAndMin[column.name] = this.maxMinColumn(column.name);
                }
            };*/

            this.updateCalculations = function() {
                this.sums = {};
                this.averages = {};
                this.maxAndMin = {};
                for (var column of this.outerColumnNames) {
                    var innerAverages = this.data.map(function(row) {
                        var avg = {};
                        if(!angular.isUndefined(row[column.name])){
                            return row[column.name].Average;
                        }
                        return avg;
                    });
                    var innerMaxs = this.data.map(function(row) {
                        var max = {};
                        if(!angular.isUndefined(row[column.name])){
                            return row[column.name].Maximum;
                        }
                        return max;
                    });
                    var innerMins = this.data.map(function(row) {
                        var min = {};
                        if(!angular.isUndefined(row[column.name])){
                            return row[column.name].Minimum;
                        }
                        return min;
                    });
                    var innerStdDev = this.data.map(function(row) {
                        var sd = {};
                        if(!angular.isUndefined(row[column.name])){
                            return row[column.name].StdDev;
                        }
                        return sd;
                    });

                    // this.sums[column.name] = rc.sum(col);
                    // this.averages[column.name] = rc.average(col);
                    this.maxAndMin[column.name] = {
                        Average: {
                            min: rc.min(innerAverages),
                            max: rc.max(innerAverages)
                        },
                        Maximum: {
                            min: rc.min(innerMaxs),
                            max: rc.max(innerMaxs)
                        },
                        Minimum: {
                            min: rc.min(innerMins),
                            max: rc.max(innerMins)
                        },
                        StdDev: {
                            min: rc.min(innerStdDev),
                            max: rc.max(innerStdDev)
                        }
                    };
                }
            };

            $scope.$watch('$ctrl.data', function(newValue, oldValue) {
                self.updateCalculations();
            });


        }
    ]
});
