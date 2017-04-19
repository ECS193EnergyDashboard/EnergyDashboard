angular.module('dataTableModule').component('datatable', {
    templateUrl: 'data-table/data-table.template.html',
    bindings: {
        tableSrc: '<',
    },
    controller: ['$filter', '$scope', function TableController($filter, $scope) {
        var self = this;
        this.data = [];
        this.sums = {};
        this.averages = {};
        this.columnNames = [];
        this.columnNamesObjs = [];




        var defaultValues = [
            // Start of AHU default values
            "ACH",
            "Air Flow Differential",
            "Air Flow Differential Setpoint",
            "Calculated Occ Total Exhaust",
            "Calculated Unocc Total Exhaust",
            "Canopy Hood High Daily Duration",
            "Canopy Hood High Monthly Duration",
            'Cooling Driving Lab',

            //Start of SubSystem default values
            "Coil Heating Energy BTU per Hr",
            "Cooling Energy BTU per Hr",
            "Heating Energy BTU per Hr",
            "Reheating Energy BTU per Hr",
            "Total Air Flow Avoided"
        ];

        this.formatValue = function(value) {
            if (value === undefined || value.value === undefined) {
                return "N/A";
            } else if (typeof(value.value) === "number") {
                return $filter('number')(value.value, 2);
            } else {
                return value.value;
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

        this.getters = {
            value: function(key, element) {
                return element[key].value;
            }
        };

        this.$onChanges = function() {
            if (this.tableSrc.length == 0) {
                return;
            }

            var columnSet = {};

            for (var element of this.tableSrc) {
                for (var key in element) {
                    if (key !== "name" && key !== "building") {
                        columnSet[key] = true;
                    }
                }
            }

            this.columnNamesObjs = [];

            this.columnNames = Object.keys(columnSet);

            var firstValues = 0;
            for (var columnName of this.columnNames) {
                var column = {};

                column.name = columnName;

                try{
                    column.units = self.tableSrc[0][column.name].unitsAbbreviation;
                }
                catch(e){
                    column.units = "";
                }
                // check if the string element is in the defaultValues array
                if (defaultValues.includes(columnName) || firstValues < 10) {
                    column.isChecked = true;
                } else {
                    column.isChecked = false;
                }
                this.columnNamesObjs.push(column);
                firstValues++;
            }

            self.data = self.tableSrc;
            this.displayed = this.data;



        }; //end $onChanges

        this.ShowColumnList = function(columnsNames) {
            // just a check to make sure the button can not be clicked when there is nothing to show
            if (columnsNames.length != 0) {
                document.getElementById("myDropdown").classList.toggle("show");
            }
        };





        this.updateCalculations = function() {
            this.sums = {};
            this.averages = {};
            for (var column of this.columnNamesObjs) {
                this.sums[column.name] = this.sumColumn(column.name);
                this.averages[column.name] = this.averageColumn(column.name);
            }
        }

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

        // For every currently displayed row in column 'columnName', applies the function 'opFunc' to the cell's value and the accumulator object 'accumulator'.
        // Returns the accumulated value object.
        this.reduceColumn = function(columnName, accumulator, opFunc) {
            var a = accumulator;
            for (var element of this.displayed) {
                var colVal = element[columnName];
                if (colVal && colVal.good && colVal.value) {
                    opFunc(colVal.value, a);
                }
            }
            return a;
        }

        this.updateCol = function(cols){
            this.columnNamesObjs = cols;
        }

        // Whenever the displayed data is changed, recalculate sum and average of the shown rows only
        $scope.$watch('$ctrl.displayed', function(newValue, oldValue) {
            console.log("Recalculating...");

            self.updateCalculations();
        });

    }]
});
