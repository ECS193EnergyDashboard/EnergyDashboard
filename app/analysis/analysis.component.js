angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        webIds: '<',
        isLoading: '='
    },
    controller: ['$filter', 'pi', function AnalysisController($filter, pi) {
            var self = this;
            this.datePicker = {};
            this.datePicker.date = {
                startDate: moment().startOf('day'),
                endDate: moment()
            };
            this.DRPOptions = {
                "showDropdowns": true,
                "timePicker": true,
                "timePickerIncrement": 60,
                "ranges": {
                    "Today": [
                        moment().startOf('day'), moment()
                    ],
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
                var startDate = self.datePicker.date.startDate.format();
                var endDate = self.datePicker.date.endDate.format();
                self.isLoading['analysis'] = 1; //Set analysis loading flag
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

                    self.columnNamesObjs = [];

                    var firstValues = 0;
                    for (var element of Object.keys(columnSet)) {
                        var column = {};
                        column.name = element;

                        /*
                    try {
                        column.units = this.data[0][column.name].unitsAbbreviation;
                    } catch(e) {
                        column.units = "";
                    }
                    */

                        if (firstValues < 10) {
                            column.isChecked = true;
                        } else {
                            column.isChecked = false;
                        }
                        colNames.push(column);
                        firstValues++;
                    }

                    self.outerColumnNames = colNames;
                    self.isLoading['analysis'] = 0; //Clear analysis loading flag
                    console.log(self.outerColumnNames);
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

            this.SetDatePicker = function(selection) {
                if (selection == 'hour') {
                    this.datePicker.date = {
                        startDate: moment().subtract(1, 'hours'),
                        endDate: moment()
                    };
                    // console.log("hour");
                }
                if (selection == 'day') {
                    this.datePicker.date = {
                        startDate: moment().subtract(1, 'days'),
                        endDate: moment()
                    };
                    // console.log("day");
                }
                if (selection == 'week') {
                    this.datePicker.date = {
                        startDate: moment().subtract(7, 'days'),
                        endDate: moment()
                    };
                    // console.log("week");
                }
                if (selection == 'month') {
                    this.datePicker.date = {
                        startDate: moment().subtract(1, 'months'),
                        endDate: moment()
                    };
                    // console.log("month");
                }
                if (selection == 'month') {
                    this.datePicker.date = {
                        startDate: moment().subtract(1, 'months'),
                        endDate: moment()
                    };
                    // console.log("month");
                }
                if (selection == 'year') {
                    this.datePicker.date = {
                        startDate: moment().subtract(1, 'years'),
                        endDate: moment()
                    };
                    // console.log("year");
                }
            }

            // this.ShowEasyPicker = function myFunction() {
            //     console.log("HEHHE");
            //     document.getElementById("myDropdown").classList.toggle("show");
            // }

        }
    ]
});
