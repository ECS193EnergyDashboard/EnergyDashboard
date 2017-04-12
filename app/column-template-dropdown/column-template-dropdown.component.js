angular.module('columnTemplateDropdownModule').component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns:        '<', //columnNamesObjs passed in (col order maintained)
        rowData:        '<', //row order not maintained, has units
        isAnalysis:     '<',
        templateSets:   '<',
        innerColumns:   '<', // Min, max, avg, st - this is needed for CSV
        updateColObj:   '&',
        dateRange:      '<'  // The date range to print on the csv
    },
    controller: [ '$http', function colTemplateController($http) {
            var self = this;
            //self.columnNamesObjs = []
            this.templates = [];
            this.showTemplates = false;
            this.includeDR = false;


            this.$onChanges = function() {

                // Get templates from server
                $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response) {
                    console.log("get templates success", response.data);
                    self.templates = response.data;
                }, function errorCallback(response) {
                    console.error("get templates failed ", response);
                });

            };


            // Get header for CSV
            this.GetHeaderData = function() {
                columnNames = [];
                columnNames.push("Name");
                columnNames.push("Building");
                for (var element of this.columns){
                    if(element.isChecked)
                        columnNames.push(element.name);
                }
                return columnNames;
            };


            // Get data for CSV for data tab
            this.GetArrayData = function() {
                var CSVData = [];

                // secondRow for the units
                var secondRow = [];
                secondRow.push(""); // Placeholder for name
                secondRow.push(""); // Placeholder for building
                for(var col of this.columns){
                    if(col.isChecked){
                        secondRow.push(col.units);
                    }
                }
                CSVData.push(secondRow);

                // Actual data
                for(var element of this.rowData){
                    var obj = {};
                    obj.name = element.name;
                    obj.building = element.building;
                    for(var col of this.columns){
                        if(col.isChecked){
                            obj[col.name] = element[col.name].value;
                        }
                    }
                    CSVData.push(obj);
                }
                return CSVData;
            }




            var numInnerColumns =0;
            // Get data for CSV for analysis tab
            this.GetArrayAnalysis = function() {
                var CSVData = [];

                // Insert date range if selected to
                if(this.includeDR == true){
                    var dateRow = [];
                    dateRow.push("Date Range:");
                    dateRow.push(this.dateRange.startDate.format());
                    dateRow.push("to");
                    dateRow.push(this.dateRange.endDate.format());

                    CSVData.push(dateRow);
                }

                // Insert header for CSV for analysis tab
                if(this.innerColumns[0].isChecked == true)
                    numInnerColumns++; // Blank space for Avg
                if(this.innerColumns[1].isChecked == true)
                    numInnerColumns++; // Blank space for Max
                if(this.innerColumns[2].isChecked == true)
                    numInnerColumns++; // Blank space for Min
                if(this.innerColumns[3].isChecked == true)
                    numInnerColumns++; // Blank space for S.D.

                var columnNames = [];
                columnNames.push(""); // Blank space for Name
                columnNames.push(""); // Blank space for Building
                for (var element of this.columns){
                    if(element.isChecked){
                        columnNames.push(element.name);
                        for(var i=0; i<numInnerColumns - 1; i++)
                            columnNames.push(" ");
                    }
                }
                CSVData.push(columnNames);


                // Create row for the units
                var unitsRow = [];
                unitsRow.push(""); // Placeholder for name
                unitsRow.push(""); // Placeholder for building
                for(var col of this.columns){
                    if(col.isChecked){
                        unitsRow.push(this.rowData[0][col.name].Average.unitsAbbreviation);
                        // Leave empty spaces for agfns
                        for(var i=0; i<numInnerColumns-1; i++){
                            unitsRow.push("");
                        }
                    }
                }
                CSVData.push(unitsRow);

                // create a second row which will have labels for min, max, et...
                var agFnsRow = [];
                agFnsRow.push("Name");
                agFnsRow.push("Building");
                for(var col of this.columns){
                    if(col.isChecked){
                        if(this.innerColumns[0].isChecked == true)
                            agFnsRow.push("AVG"); // Blank space for Avg
                        if(this.innerColumns[1].isChecked == true)
                            agFnsRow.push("MAX"); // Blank space for Max
                        if(this.innerColumns[2].isChecked == true)
                            agFnsRow.push("MIN"); // Blank space for Min
                        if(this.innerColumns[3].isChecked == true)
                            agFnsRow.push("S.D."); // Blank space for S.D.
                    }
                }
                CSVData.push(agFnsRow);

                // set the other rows of the CSV file
                for(var element of this.rowData){
                    var elmRow = [];
                    elmRow.push(element.name);
                    elmRow.push(element.building);
                    for(var col of this.columns){
                        // Check if that col is checked
                        if(col.isChecked){
                            // Check if undefined
                            if(element[col.name] === undefined){
                                for(i=0; i<numInnerColumns; i++){
                                    elmRow.push("NA");
                                }
                            }
                            else{   // A value exists


                                // If avg checked
                                if(this.innerColumns[0].isChecked){
                                    // Check Avg value is good
                                    if(element[col.name].Average.good)
                                        elmRow.push(element[col.name].Average.value);
                                        // [-11059] No Good Data For Calculation
                                    else
                                        elmRow.push("Bad Value");
                                }

                                // If max checked
                                if(this.innerColumns[1].isChecked){
                                    // check Max value is good
                                    if(element[col.name].Maximum.good)
                                        elmRow.push(element[col.name].Maximum.value);
                                    else
                                        elmRow.push("Bad Value");
                                }

                                // If min checked
                                if(this.innerColumns[2].isChecked){
                                    // Check min value is good
                                    if(element[col.name].Minimum.good)
                                        elmRow.push(element[col.name].Minimum.value);
                                    else
                                        elmRow.push("Bad Value");
                                }

                                // If S.D. checked
                                if(this.innerColumns[3].isChecked){
                                    // check StdDev value is good
                                    if(element[col.name].StdDev.good)
                                        elmRow.push(element[col.name].StdDev.value);
                                    else
                                        elmRow.push("Bad Value");
                                }
                            }
                        }
                    }

                    CSVData.push(elmRow);

                }

                return CSVData;
            }

            // save template/profile for cols
            this.SaveColumnList = function(columnObjs) {
                var colObjToAdd = JSON.parse(angular.toJson(columnObjs));
                var template = {
                    "templateName": this.currTemplateName,
                    "colObj": colObjToAdd,
                };
                this.templates.push(template);
                console.log("added template ", this.templates);

                // POST template/profile to server
                $http({
                    method: 'POST',
                    url: '/templates',
                    data: angular.toJson(template),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function successCallback(response) {
                    console.log("POST Templates Success");
                    document.getElementById("templateInput").value = "";
                }, function errorCallback(response) {
                    console.error("POST Failed ", response);
                });
            };


            this.ApplyTemplate = function(template){
                this.columns = template.colObj;
                this.updateColObj({cols: template.colObj});  //output binding
            };



            // Default file name for downloading to CSV
            this.fileName = "Data.csv";





        } //end controller
    ]

});
