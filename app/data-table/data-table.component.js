angular.module('dataTableModule').component('datatable', {
    templateUrl: 'data-table/data-table.template.html',
    bindings: {
        tableSrc: '<',
        searchEnabled: '<',
        reorderEnabled: '<',
        loading: '<'
    },
    controller: ['$filter', '$http', function TableController($filter, $http) {
        var self = this;
        this.data = [];
        this.columnNames = [];
        this.columnNamesObjs = [];
        this.templates = [];
        this.showTemplates = false;

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

            self.columnNamesObjs = [];

            self.columnNames = Object.keys(columnSet);

            var firstValues = 0;
            for (var element of self.columnNames) {
                var column = {};
                column.name = element;
                // check if the string element is in the defaultValues array
                if (defaultValues.includes(element) || firstValues < 10) {
                    column.isChecked = true;
                } else {
                    column.isChecked = false;
                }
                self.columnNamesObjs.push(column);
                firstValues++;
            }

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

        this.ShowColumnList = function(columnsNames) {
            // just a check to make sure the button can not be clicked when there is nothing to show
            if (columnsNames.length != 0) {
                document.getElementById("myDropdown").classList.toggle("show");
            }
        };

        // save template/profile for cols
        this.SaveColumnList = function(columnObjs) {
            var colObjToAdd = [];
            for(var i=0; i<columnObjs.length; i++){
                // console.log(i, columnObjs[i]);
                colObjToAdd[i]  = jQuery.extend(true, {}, columnObjs[i]);
            }
            colObjToAdd.templateName = this.currTemplateName;
            this.templates.push(colObjToAdd);

            // POST template to server
            $http({
                method: 'POST',
                url: '/templates',
                data: JSON.stringify(this.templates),
                headers: {'Content-Type': 'application/json'}
            }).then(function successCallback(response) {
                console.log("post templates success");
            }, function errorCallback(response) {
                console.error("post failed ", response);
            });
        };

        this.ApplyTemplate = function(template){
            this.columnNamesObjs = template;
        };


    }]
});
