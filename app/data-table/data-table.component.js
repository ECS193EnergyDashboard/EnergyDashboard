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
                    if (key !== "name") {
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

                try{
                    column.units = self.tableSrc[0][column.name].unitsAbbreviation;
                }
                catch(e){
                    column.units = "";
                }

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
                name: 'Total'
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
            var colObjToAdd = columnObjs.slice();
            colObjToAdd.templateName = this.currTemplateName;
            this.templates.push(colObjToAdd);
            console.log("templates: ", self.templates);
            // POST template to server
            $http({
                method: 'POST',
                url: '/templates',
                data: this.templates,
                headers: {
                   'Content-Type': 'application/json'
                 }
            }).then(function successCallback(response) {
                document.getElementById("templateInput").value = "";
                // this callback will be called asynchronously
                // when the response is available
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        };

    }]
});



// Close dropdowns if there is a click outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    if (!event.target.matches('.dropdownelm')) {
        if (!event.target.matches('.dropDownCheckBox')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
              var openDropdown = dropdowns[i];
              if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
              }
            }
          }
        }
    }
}
