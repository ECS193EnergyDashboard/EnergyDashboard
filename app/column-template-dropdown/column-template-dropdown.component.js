angular.module('columnTemplateDropdownModule').component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns:        '<', //columnNamesObjs passed in (col order maintained),  current set of cols
        rowData:        '<', //row order not maintained, has units
        isAnalysis:     '<',
        templateSets:   '<',
        innerColumns:   '<', // Min, max, avg, st - this is needed for CSV
        updateColObj:   '&', // Output binding to update the table
        dateRange:      '<', // The date range to print on the csv
        elemName:       '<'  // Element name to determine template type (from side-nav)
    },
    controller: [
        '$http',
        function colTemplateController($http) {
            var self = this;
            this.templates = [];
            this.showTemplates = false;
            this.includeDR = false;
            var numInnerColumns =0;

            this.currentTemplate = {};

            // Default file name for downloading to CSV
            this.fileName = "Data.csv";

            // an error message for the modal. Always set the error message before showing modal
            this.errorMessage = "";

            // Determine the type of current element
            this.curType = "";

            this.determineType = function(){
                var regexpAHU = /ahu/gi;
                var regexpRM = /ahu\d/gi;
                if(this.elemName.match(regexpRM)){
                    this.curType = "room";
                    //alert("room");
                }
                else if (this.elemName.match(regexpAHU)) {
                    this.curType = "ahu";
                    //alert("ahu");
                }
            };


            this.$onInit = function(){
                this.determineType();

            }

            this.$onChanges = function() {
                this.determineType();
                // Get templates from server
                this.getTemplates();

            };

            // Generate default, push it to templates, and post to server
            this.generateDefault = function(){
                var firstValues = 0;
                for(var col of this.columns){
                   if (firstValues < 10) {
                        col.isChecked = true;
                    } else {
                        col.isChecked = false;
                    }
                    firstValues++;
                }

                var template = {
                    "name": "Default",
                    "colObj": this.columns,
                    "type": this.curType,
                    "isDefault": "true"
                };
                this.currentTemplate = template;
                this.templates.push(template);

                // Post the default
                this.postTemplate(template);


            }

            this.isDefault = function(template){
                if(template.name == "Default" || template.name == "default"){
                    if(template.isDefault == true && template.type == this.curType){
                        return true;
                    }
                }
                return false;
            };

            this.getTemplates = function(){
                // Get templates from server
                $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response) {
                    //console.log("get templates success", response.data);
                    self.templates = response.data;

                    // If default doesnt exists yet
                    if(self.templates.find(self.isDefault) == undefined && self.columns != undefined){
                        self.generateDefault();
                    }

                }, function errorCallback(response) {
                    console.error("get templates failed ", response);
                });


            };

            this.GetHeaderData = function() {
                columnNames = [];
                columnNames.push("Name");
                columnNames.push("Building");
                for (var element of this.columns) {
                    if (element.isChecked)
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
                    for (var col of this.columns) {
                        if (col.isChecked) {
                            obj[col.name] = element[col.name].value;
                        }
                    }
                    CSVData.push(obj);
                }
                return CSVData;
            }



            // Get data and headers for CSV for analysis tab
             this.GetArrayAnalysis = function() {
                 numInnerColumns = 0;
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


            // Save template/profile for cols
            // Called in html with $ctrl.columns
            this.SaveColumnList = function(columnObjs) {


                // Check to make sure template is not named default or name is already taken
                if(this.newTemplateName == "Default"){
                    // console.log("Cant have a template named Default");
                    this.errorMessage = "We're sorry but you can not have a template named Default";
                    $("#templateInput").val(''); // clear the inputbox
                    this.ShowErrorModal();
                    return;
                }
                for(temp of this.templates){
                    if(this.newTemplateName == temp.name){
                        this.ShowSaveAsModal();
                        return;
                    }
                }

                var colObjToAdd = JSON.parse(angular.toJson(columnObjs)); // Make clone


                var template = {
                    "name": this.newTemplateName,
                    "colObj": colObjToAdd,
                    "type": this.curType,
                    "isDefault": "false"
                };
                this.templates.push(template);
                console.log("added template ", this.templates);

                this.postTemplate(template);
                $("#templateInput").val(''); // clear the inputbox

                this.currentTemplate = template;
            };

            // POST template/profile to server
            this.postTemplate = function(template){
                $http({
                    method: 'POST',
                    url: '/templates',
                    data: angular.toJson(template),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function successCallback(response) {
                    //console.log("POST Templates Success");
                    //document.getElementById("templateInput").value = "";
                }, function errorCallback(response) {
                    console.error("POST templates Failed ", response);
                });
            }

            // A function to apply a template to the data table
            this.ApplyTemplate = function(template){
                this.currentTemplate = template;
                this.columns = template.colObj;
                this.updateColObj({cols: template.colObj});  //output binding
            };



            this.DeleteTemplate = function(){
                var template = {
                    "name": this.currentTemplate.name,
                };
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
                this.getTemplates();
                $('.modal-backdrop').remove(); // Hard remove backdrop - HOT FIX
            };

            // A function to overwrite the template on the server
            this.OverwriteTemplate = function(template, overWriteTemplateName){
                var template = {
                    "name": overWriteTemplateName,
                };
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
                

                var colObjToAdd = JSON.parse(angular.toJson(template)); // Make clone


                var template = {
                    "name": overWriteTemplateName,
                    "colObj": colObjToAdd,
                    "type": this.curType,
                    "isDefault": "false"
                };
                this.templates.push(template);
                console.log("added template ", this.templates);

                this.postTemplate(template);
                $("#templateInput").val(''); // clear the inputbox

                this.currentTemplate = template;

            };


            //========-- Start of modal code --=========//

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

            this.ShowErrorModal = function(){
                if(this.isAnalysis == "true"){
                    $(".errorModalAnalysis").modal();
                }
                else{
                    $(".errorModalData").modal();
                }
            }

            this.ShowSaveAsModal = function(){
                if(this.isAnalysis == "true"){
                    $(".saveAsModalAnalysis").modal();
                }
                else{
                    $(".saveAsModalData").modal();
                }                
            }


        } //end controller
    ]

});
