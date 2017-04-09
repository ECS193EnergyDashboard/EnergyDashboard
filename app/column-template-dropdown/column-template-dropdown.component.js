angular.module('columnTemplateDropdownModule').component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns: '<',
        rowData: '<',
        isAnalysis: '<',
        templateSets: '<',
        updateColObj: '&'
    },
    controller: [ '$http', function colTemplateController($http) {
            var self = this;
            //self.columnNamesObjs = []
            this.templates = [];
            this.showTemplates = false;


            this.$onChanges = function() {
                //console.log("columnTemplateDropdown cols : ", this.columns);

                // Get templates from server
                $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response) {
                    console.log("get templates success", response.data);
                    self.templates = response.data;
                }, function errorCallback(response) {
                    console.error("get templates failed ", response);
                });

                console.log("is analysis", this.isAnalysis);

            };



            this.GetHeader = function() {
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
            this.GetArray = function() {
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


            this.DownloadCSV = function(){
                console.log('DOwnloading CSV');
            };


            this.fileName = "Data.csv";





        } //end controller
    ]

});
