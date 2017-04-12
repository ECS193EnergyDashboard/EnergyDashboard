angular.module('columnTemplateDropdownModule').component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns: '<',
        rowData: '<',
        isAnalysis: '<',
        templateSets: '<',
        innerColumns: '<', // Min, max, avg, st - this is needed for CSV
        updateColObj: '&'
    },
    controller: [ '$http', function colTemplateController($http) {
            var self = this;
            //self.columnNamesObjs = []
            this.templates = [];
            this.showTemplates = false;

            this.currentTemplate = {};
            this.currentTemplateName = "Default";

            // Default file name for downloading to CSV
            this.fileName = "Data.csv";


            this.$onChanges = function() {
                // Get templates from server
                $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response) {
                    console.log("get templates success", response.data);
                    self.templates = response.data;
                }, function errorCallback(response) {
                    console.error("get templates failed ", response);
                });

            };


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


            // ASK JUSTIN: Should this display units? on column name or in rows?
            this.GetArrayData = function() {
                var CSVData = [];
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

            var inner =0;
            this.GetHeaderAnalysis = function() {
                var numInnerColumns = 0;
                if(this.innerColumns[0].isChecked == true)
                    numInnerColumns++; // Blank space for Avg
                if(this.innerColumns[1].isChecked == true)
                    numInnerColumns++; // Blank space for Max
                if(this.innerColumns[2].isChecked == true)
                    numInnerColumns++; // Blank space for Min
                if(this.innerColumns[3].isChecked == true)
                    numInnerColumns++; // Blank space for S.D.

                inner = numInnerColumns;
                var columnNames = [];
                columnNames.push(" "); // Blank space for Name
                columnNames.push(" "); // Blank space for Building
                for (var element of this.columns){
                    if(element.isChecked){
                        columnNames.push(element.name);
                        for(var i=0; i<numInnerColumns - 1; i++)
                            columnNames.push(" ");
                    }
                }
                return columnNames;
            };


            // ASK JUSTIN: Should this display units? on column name or in rows?
            this.GetArrayAnalysis = function() {
                var CSVData = [];

                // create a second row which will have labels for min, max, et...
                var secondCol = [];
                secondCol.push("Name");
                secondCol.push("Building");
                for(var col of this.columns){
                    if(col.isChecked){
                        if(this.innerColumns[0].isChecked == true)
                            secondCol.push("AVG"); // Blank space for Avg
                        if(this.innerColumns[1].isChecked == true)
                            secondCol.push("MAX"); // Blank space for Max
                        if(this.innerColumns[2].isChecked == true)
                            secondCol.push("MIN"); // Blank space for Min
                        if(this.innerColumns[3].isChecked == true)
                            secondCol.push("S.D."); // Blank space for S.D.
                    }
                }
                CSVData.push(secondCol);

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
                                for(i=0; i<inner; i++){
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
            // BILLY: START HERE FIX THIS
            this.SaveColumnList = function(columnObjs) {
                // console.log("columnObjs ", columnObjs);
                for(temp of this.templates){
                    if(this.newTemplateName == temp.templateName || 
                        this.templateName == "Default"){
                        console.log("Cant have 2 templates of same name");
                        return;
                    }
                }
                var colObjToAdd = JSON.parse(angular.toJson(columnObjs));
                var template = {
                    "templateName": this.newTemplateName,
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
                this.currentTemplate = template;
                this.currentTemplateName = this.newTemplateName;
            };

            // A function to apply a template to the data table
            this.ApplyTemplate = function(template){
                this.currentTemplate = template;
                this.columns = template.colObj;
                this.updateColObj({cols: template.colObj});  //output binding
                this.currentTemplateName = template.templateName;
            };

            // Resets the template to the first 10 cols
            this.ApplyDefaultTemplate = function(){
                var firstValues = 0;
                for(var col of this.columns){
                   if (firstValues < 10) {
                        col.isChecked = true;
                    } else {
                        col.isChecked = false;
                    }
                    firstValues++;
                }
                this.currentTemplate = {};
                this.currentTemplateName = "Default";
            }


            this.DeleteTemplate = function(){
                var template = {
                    "templateName": this.currentTemplateName,
                };
                var index = this.templates.indexOf(this.currentTemplate);
                console.log(index);
                if (index > -1) {
                    this.templates.splice(index, 1);
                }
                $http({
                    method: 'POST',
                    url: '/templatesDelete',
                    data: angular.toJson(template),
                }).then(function successCallback(response) {
                    console.log("POST Templates Success");
                    document.getElementById("templateInput").value = "";
                }, function errorCallback(response) {
                    console.error("POST Failed ", response);
                });
                this.ApplyDefaultTemplate();
                // Hard remove backdrop - HOT FIX
                $('.modal-backdrop').remove(); 
            };

            //Start of modal code//

            this.ShowDeleteModal = function(){
                if(this.isAnalysis == "true"){
                    $(".deleteModalAnalysis").modal();
                }
                else{
                    $(".deleteModalData").modal();
                }
            }

            this.ShowSaveModal = function(){
                if(this.isAnalysis == "true"){
                    $(".saveModalAnalysis").modal();
                }
                else{
                    $(".saveModalData").modal();
                }
            }

            this.ShowDownloadModal = function(){
                if(this.isAnalysis == "true"){
                    $(".downloadModalAnalysis").modal();
                }
                else{
                    $(".downloadModalData").modal();
                }               
            }

        } //end controller
    ]

});
