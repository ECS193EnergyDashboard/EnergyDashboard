angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        webIds:      '<',
        elemName:    '<', // passed to columnTemplate component to determine template type
        onStartLoad: '&',
        onEndLoad:   '&',
        newTemplate:  '<',
        createTemplateDropdown: '&',
        deleteTemplateDropdown: '&'
    },
    controller: [
        '$filter',
        'pi',
        function AnalysisController($filter, pi) {
            var self = this;
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

            // Passes the currentTemplate up to the dashboard component
            this.createTemplate = function(currentColumns, type){
                this.createTemplateDropdown({currentColumns: currentColumns, type: type});
                return true;
            }
            this.deleteTemplate = function(deleteTemplate){
                this.createTemplateDropdown({deleteTemplate: deleteTemplate, type: type});
                return true;
            }

        }
    ]
});
