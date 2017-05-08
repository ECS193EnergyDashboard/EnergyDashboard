angular.module('dataTableModule').component('datatable', {
    templateUrl: 'data-table/data-table.template.html',
    bindings: {
        tableSrc:       '<',
        searchEnabled:  '<',
        reorderEnabled: '<',
        elemName:       '<',   // passed to columnTemplate component to determine template type
        selection:      '='
    },
    controller: ['$filter', '$scope', function TableController($filter, $scope) {
        var self = this;
        this.data = [];
        this.sums = {};
        this.averages = {};
        this.columnNames = [];
        this.columnNamesObjs = [];
        this.maxAndMin = {};

        // Conditional Formatting Points
        this.colsPoints = {};
        function rgb(r, g, b) {
            return { r: r, g: g, b: b };
        }
        this.blue = rgb(0, 0, 255);
        this.white = rgb(255, 255, 255);
        this.red = rgb(255, 0, 0);


        var selectionIndexOf = function(obj) {
            for (var i = 0; i < self.selection.length; i++) {
                if (self.selection[i].webId === obj.webId) {
                    return i;
                }
            }
            return -1;
        }

        var isSelected = function(obj) {
            return selectionIndexOf(obj) !== -1;
        }

        var deselect = function(obj) {
            var idx = selectionIndexOf(obj);
            if (idx !== -1) {
                self.selection.splice(idx, 1);
            }
        }

        var select = function(obj) {
            if (!isSelected(obj)) {
                self.selection.push(obj);
            }
        }

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
            var style = 'dataCell ';
            if (value === undefined) {
                style += 'missing';
            } else if (!value.good) {
                style += 'bad ';
            }
            if (value && isSelected(value)) {
                style += 'selected ';
            }
            return style;
        }



        this.getters = {
            value: function(key, element) {
                if(element[key] == undefined){
                    return;
                }
                return element[key].value;
            }
        };

        this.$onChanges = function() {
            if (this.searchEnabled === undefined) {
                this.searchEnabled = true;
            }
            if (this.reorderEnabled === undefined) {
                this.reorderEnabled = true;
            }
            if (this.selection === undefined) {
                this.selection = [];
            }
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
                //All columns start showing conditional formating
                column.showConditionalFormat = true;

                try{
                    column.units = self.tableSrc[0][column.name].unitsAbbreviation;
                }
                catch(e){
                    column.units = "";
                }
                // Set the first 10 values as default
                if (firstValues < 10) {
                    column.isChecked = true;
                } else {
                    column.isChecked = false;
                }
                this.columnNamesObjs.push(column);
                firstValues++;
            }

            for (var element of this.tableSrc) {
                for (var name in element) {
                    Object.assign(element[name], { parentName: element.name, buildingName: element.building });
                }
            }
            console.log(this.columnNamesObjs);

            this.displayed = this.data = this.tableSrc;
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
            this.maxAndMin = {};
            for (var column of this.columnNamesObjs) {
                this.sums[column.name] = this.sumColumn(column.name);
                this.averages[column.name] = this.averageColumn(column.name);
                this.maxAndMin[column.name] = this.maxMinColumn(column.name);
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
            for (var element of this.displayed) {
                var colVal = element[columnName];
                if (colVal && colVal.good && colVal.value != undefined) {
                    opFunc(colVal.value, a);
                }
            }
            return a;
        }

        this.updateCol = function(cols){
            this.columnNamesObjs = cols;
        }

        this.toggleCellSelected = function(value) {
            if (isSelected(value)) {
                deselect(value);
            } else {
                select(value);
            }
        }

        // =====--- CONDITIONAL FORMATTING ---===== //



        this.conditionalFormat = function(value, showConditionalFormat){
            // console.log(showConditionalFormat);
            // conditionalFormatShow = false;
            if(showConditionalFormat == false){
                console.log(value);
                return {"background-color": "white"}
            }
            if(value == undefined || !value.good || this.maxAndMin[value.name] == undefined){
                return {};
            }
            var max = this.maxAndMin[value.name].max;
            var min = this.maxAndMin[value.name].min;
            if(max == min){
                return {};
            }
            this.colsPoints[value.name] = [
                { value: min, color: this.blue },
                { value: (max+min)/2, color: this.white },
                { value: max, color: this.red },
            ]

            var color = gradient(this.colsPoints[value.name])(value.value);

            var textColor = "white";
            // Calculate overall intensity of color to determine text color
            var intensity = color.r * 0.299 + color.g * 0.597 + color.b * 0.114;
            if (intensity > 186) {
                textColor = "black";
            }

            return { "background-color": "rgb(" +color.r+ "," +color.g+ "," +color.b+ ")",
                    "color": textColor };
        }

        // Whenever the displayed data is changed, recalculate sum and average of the shown rows only
        $scope.$watch('$ctrl.displayed', function(newValue, oldValue) {
            console.log("Recalculating...");

            self.updateCalculations();
        });

    }]
});
