angular.module('dataTableModule').component('datatable', {
    templateUrl: 'data-table/data-table.template.html',
    bindings: {
        tableSrc: '<',
        searchEnabled: '<',
        reorderEnabled: '<',
        loading: '<'
    },
    controller: ['$filter', function TableController($filter) {
        var self = this;
        this.data = [];
        this.columnNames = [];

        this.formatValue = function(value, decimals) {
            var decimals = decimals || 2;
            var result = "";
            if (value === undefined) {
                return "N/A";
            } else if (typeof(value.value) === "number") {
                result += $filter('number')(value.value, decimals);
                if (value.unitsAbbreviation) {
                    result += " " + value.unitsAbbreviation;
                }
            } else {
                result += value.value;
            }
            return result;
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

        this.getters = {
            value: function(key, element) {
                return element[key].value;
            }
        };

        this.$onChanges = function() {
            if (self.searchEnabled === undefined) {
                self.searchEnabled = false;
            }
            if (self.reorderEnabled === undefined) {
                self.reorderEnabled = false;
            }
            if (self.tableSrc.length == 0) {
                return;
            }

            var columnSet = {};

            for (var element of self.tableSrc) {
                for (var key in element) {
                    if (key !== "Name") {
                        columnSet[key] = true;
                    }
                }
            }

            self.columnNames = Object.keys(columnSet);
            self.data = self.tableSrc;

            var sums = {
                Name: 'Total'
            };
            for (var column of self.columnNames) {
                sums[column] = {
                    value: 0,
                    good: false
                };
                for (var element of self.data) {
                    var colVal = element[column];
                    if (colVal && colVal.good) {
                        var sumVal = sums[column];
                        sumVal.value += colVal.value;
                        if (!sumVal.good) {
                            sumVal.good = true;
                            sumVal.unitsAbbreviation = colVal.unitsAbbreviation;
                        }
                    }
                }
            }

            self.data.push(sums);

            console.log("Table data: ", self.columnNames, self.data);
        };

    }]
});
