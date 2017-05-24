angular.module('columnTemplateDropdownModule')
    .filter('type', function(){
        return function(templates, types){
            var filteredTemplates = [];
            for(var template of templates){
                for(piTemplate of template.type){
                    if(types.includes(piTemplate) && !(filteredTemplates.includes(template) )){
                        filteredTemplates.push(template);
                    }
                }
            }
            return filteredTemplates;
        }
    }
).component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns:        '<', //columnNamesObjs passed in (col order maintained),  current set of cols
        rowData:        '<', //row order not maintained, has units
        isAnalysis:     '<',
        templateSets:   '<',
        innerColumns:   '<', // Min, max, avg, st - this is needed for CSV
        updateColObj:   '&', // Output binding to update the table
        dateRange:      '<', // The date range to print on the csv
        elemName:       '<',  // Element name to determine template type (from side-nav)
        sideSelectorItems: '<'
    },
    controller: [
        '$scope', '$http', 'typeFilter',
        function colTemplateController($scope, $http, typeFilter) {
            var self = this;
            this.templates = [];
            this.filteredTemplates = [];
            this.showTemplates = false;
            this.includeDR = false;
            var numInnerColumns = 0;
            this.currentTemplate = {};
            this.filteredColumns = [];

            this.piTemplatesInUse = []

            this.unalteredCurrentTemplate = {};

            this.newTemplateName = "";
            this.curType == "";


            // Default file name for downloading to CSV
            this.fileName = "Data.csv";
            // an error message for the modal. Always set the error message before showing modal
            this.errorMessage = "";


            if(this.elemName === undefined){
                this.elemName = "";
            }

            this.$onInit = function(){
                // this.determineType();
            }


            // A watcher for the current template used to set the color of the Save button
            $scope.$watch('$ctrl.currentTemplate', function(newVal, oldVal){
                // console.log("Watch");
                if(angular.equals(self.unalteredCurrentTemplate, newVal.colObj)){
                    if(self.isAnalysis == "true"){
                        $('.saveTemplateButtonAnalysis').css({'color': 'green'});
                    }
                    else{
                        $('.saveTemplateButtonData').css({'color': 'green'});
                    }
                }
                else{

                    if(self.isAnalysis == "true"){

                        $('.saveTemplateButtonAnalysis').css({'color': 'red'});
                    }
                    else{
                        $('.saveTemplateButtonData').css({'color': 'red'});
                    }
                }
            }, true);



            this.$onChanges = function(changes){
                // if(changes.columns){
                //     this.unalteredCurrentTemplate = JSON.parse(JSON.stringify(this.columns));

                //     if(this.isAnalysis == "true"){
                //         $('.saveTemplateButtonAnalysis').css({'color': 'green'});
                //     }
                //     else{
                //         $('.saveTemplateButtonData').css({'color': 'green'});
                //     }
                // }

                if(!angular.isUndefined(this.sideSelectorItems)){
                    // Check to see if there is no data - if not reset curtemplate
                    if(this.sideSelectorItems.length == 1 && this.sideSelectorItems[0].building == "dummyItem"){
                        this.currentTemplate = {};
                    }


                    this.getPiTemplates();
                    this.getTemplates();

                    if(angular.equals(this.currentTemplate, {}) || angular.isUndefined(this.currentTemplate)){
                        if(this.rowData.length != 0){
                            this.restoreDefault();
                            console.log("restoring default");
                        }
                    }
                    else if(currentTemplate.name == "Default"){
                        console.log("current temp", this.currentTemplate);
                    }


                    // // If there is only one thing in there then use the default for the specific template
                    // if(angular.equals(this.currentTemplate, {}) && this.sideSelectorItems.length != 0){
                    //     if(this.piTemplatesInUse.length == 1){
                    //         console.log
                    //         var defaultTemplate;
                    //         this.curType = this.piTemplatesInUse[0]
                    //         for(temp of this.templates){
                    //             if(temp.type == this.piTemplatesInUse[0] && temp.name == "Default"){
                    //                 console.log("Found default template");
                    //                 defaultTemplate = temp;
                    //                 this.ApplyTemplate(temp);
                    //             }
                    //         }
                    //         // If no default template was found need to create it
                    //         if(angular.isUndefined(defaultTemplate)){
                    //             console.log("Generating default");
                    //             self.generateDefault(this.piTemplatesInUse[0]);
                    //         }



                    //     }
                    //     // There is more than one pi template.
                    //     else{


                    //     }

                    // } // end if(this.curType)...

                }



                this.updateFiltered();

            };

            this.restoreDefault = function(){
                var count = 0;
                for(col of this.columns){
                    if(count < 10){
                        col.isChecked = true;
                    }
                    else{
                        col.isChecked = false;
                    }
                    count++;
                }

                // Dummy template
                var template = {
                    "name": "Default",
                    "colObj": this.columns,
                    "type": "",
                    "isDefault": "true",
                };

                // this.currentTemplate = template; 
                this.ApplyTemplate(template);   
            }



            this.getPiTemplates = function(){
                var piTemplates = [];
                if(!angular.isUndefined(this.sideSelectorItems)){
                    for(item of this.sideSelectorItems){
                        if(!piTemplates.includes(item.template))
                            piTemplates.push(item.template)
                    }
                    this.piTemplatesInUse = piTemplates;
                    // Remove "" from array
                    for(var i = this.piTemplatesInUse.length - 1; i >= 0; i--) {
                        if(this.piTemplatesInUse[i] === "") {
                            this.piTemplatesInUse.splice(i, 1);
                        }
                    }
                }
            };


            this.updateFiltered = function(){
                this.filteredTemplates = typeFilter(this.templates, self.piTemplatesInUse);
            }



            // Generate default, push it to templates, and post to server
            this.generateDefault = function(piTemplate){
                // console.log("generating default...");
                var firstValues = 0;
                for(var col of self.columns){
                   if (firstValues < 10) {
                        col.isChecked = true;
                    } else {
                        col.isChecked = false;
                    }
                    firstValues++;
                }

                // Make clone, otherwise they are same reference
                var colObjToAdd = JSON.parse(angular.toJson(self.columns));
                if(colObjToAdd.length == 0){
                    return;   
                }
                var template = {
                    "name": "Default",
                    "colObj": colObjToAdd,
                    "type": piTemplate,
                    "isDefault": "true",
                    // "test": {"t1":'x', 't2': 'y'}
                };
                self.currentTemplate = template;
                self.curType = template.type;

                // Push to templates
                self.templates.push(template);
                self.updateFiltered();

                // Post the default
                self.postTemplate(template);
            }


            this.getTemplates = function(){
                // Get templates from server
                $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response){
                    //console.log("get templates success", response.data);
                    self.templates = response.data;
                    console.log("updating filtered");
                    self.updateFiltered();

                    // self.determineType();


                }, function errorCallback(response) {
                    console.error("get templates failed ", response);
                });


            };

            this.clearAll = function() {
                for(var i = 0; i < this.filteredColumns.length; i++){
                    this.filteredColumns[i].isChecked = false;
                }
            };

            this.selectAll = function(){
                for(var i = 0; i < this.filteredColumns.length; i++){
                    this.filteredColumns[i].isChecked = true;
                }
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
            this.saveTemplate = function(columnObjs) {
                if(this.isAnalysis == "true"){
                    this.newTemplateName = $(".newTemplateNameAnalysis").val();
                }
                else{
                    this.newTemplateName = $(".newTemplateNameData").val();
                }

                // Check to make sure template is not named default or name is already taken
                if(this.newTemplateName == "Default"){

                    this.errorMessage = "You can not save over the default template";
                    this.ShowErrorModal();
                    // this.ShowSaveDefaultModal();
                    return;
                }
                if(this.newTemplateName == ""){
                    this.errorMessage = "Please enter a name for the template";
                    this.ShowErrorModal();
                    return;                   
                }
                for(templ of this.templates){
                    // New template name already exists and its type is the current type
                    if(this.newTemplateName == templ.name){
                        this.ShowSaveAsModal();
                        return;
                    }
                }

                var colObjToAdd = JSON.parse(angular.toJson(columnObjs)); // Make clone

                var template = {
                    "name": this.newTemplateName,
                    "colObj": colObjToAdd,
                    "type": this.piTemplatesInUse,
                    "isDefault": "false"
                };
                this.templates.push(template);

                this.postTemplate(template);
                $("#templateInput").val(''); // clear the inputbox

                this.ApplyTemplate(template);

                // Hide both copies - we dont know which was opened
                $(".saveModalData").modal('hide');
                $(".saveModalAnalysis").modal('hide');
                // this.ShowSaveModal();
                this.ClearTemplateNameInput();
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
                var colObjToAdd = JSON.parse(angular.toJson(template.colObj)); // Make clone
                this.columns = template.colObj;
                this.updateColObj({cols: template.colObj});  //output binding
                $('.menuDropdown.open').removeClass('open'); // close dropdown if it is open
                this.unalteredCurrentTemplate = JSON.parse(JSON.stringify(this.columns));
                this.getTemplates();
                if(this.isAnalysis == "true"){
                    $('.saveTemplateButtonAnalysis').css({'color': 'green'});
                }
                else{
                    $('.saveTemplateButtonData').css({'color': 'green'});
                    console.log("making green");
                }

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
                    // Update templates
                    self.getTemplates();

                    // Apply default template
                    // for(var template of self.templates){
                    //     // Is default of current type
                    //     if(template.name == "Default" && template.isDefault == "true" && template.type == self.curType){
                    //         self.currentTemplate = template;
                    //     }
                    // }
                    if(self.templates.length == 1){
                        console.log("true");
                        self.templates = [];
                    }
                    self.restoreDefault();
                    console.log("POST Templates Success");
                    document.getElementById("templateInput").value = "";
                }, function errorCallback(response) {
                    console.error("POST Failed ", response);
                });

                $('.modal-backdrop').remove(); // Hard remove backdrop - HOT FIX

            };

            // A function to overwrite the template on the server
            this.OverwriteTemplate = function(templateCols, overWriteTemplateName){
                var template;

                // Find template by name and type
                for(template of self.templates){
                    // Is default of current type
                    if(template.name == overWriteTemplateName){
                        break;
                    }
                }
                template.colObj = templateCols;
                $http({
                    method: 'POST',
                    url: '/templatesUpdate',
                    data: angular.toJson(template),
                }).then(function successCallback(response) {
                    document.getElementById("templateInput").value = "";
                }, function errorCallback(response) {
                    console.error("POST Failed ", response);
                });

                // Close both modals
                $(".saveModalData").modal('hide');
                $(".saveModalAnalysis").modal('hide');

                this.getTemplates();
                // console.log(this.templates);
                this.ApplyTemplate(template);
                for(temp of self.templates){
                    // Is default of current type
                    if(temp.name == overWriteTemplateName && temp.type == self.curType){
                        this.ApplyTemplate(temp);
                        this.unalteredCurrentTemplate = JSON.parse(JSON.stringify(temp.colObj));
                    }
                }

                this.ClearTemplateNameInput();

            };

            this.switchColumnIsChecked = function(col){
                if(angular.isUndefined(col))
                    return;
                col.isChecked = !col.isChecked;
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

            this.ShowSaveDefaultModal = function(){
                if(this.isAnalysis == "true"){
                    $(".saveDefaultModalAnalysis").modal();
                }
                else{
                    $(".saveDefaultModalData").modal();
                }
            }

            this.ClearTemplateNameInput = function(){
                this.newTemplateName = "";
                // $("#templateInput").val(''); // clear the inputbox
            }

            $(document).on('click', '.dropdown-menu', function (e) {
                e.stopPropagation();
            });


        } //end controller
    ]

});
