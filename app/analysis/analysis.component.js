angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        webIds: '<'
    },
    controller: ['$filter', 'pi', function AnalysisController($filter, pi) {
        var self = this;
        this.datePicker={};
        this.datePicker.date = {startDate: moment().startOf('day'), endDate: moment() };
        this.data = [];

        this.outerColumnNames = [];
        this.innerColumnNames = [
            {
                name: "Average",
                isChecked: true
            },
            {
                name: "Maximum",
                isChecked: true
            },
            {
                name: "Mininum",
                isChecked: true
            }, {
                name: "StdDev",
                isChecked: true
            }
        ];

        this.startAnalysis = function() {
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
                        if (key !== "name") {
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
            });
        };

        this.getters =  {
            value: function(outerName, innerName, element) {
                return element[outerName][innerName].value;
            }
        };

    }]
});