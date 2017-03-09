angular.module('columnTemplateDropdownModule').component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns: '=',
        templateSets: '<'
    },
    controller: [ '$http', function colTemplateController($http) {
            var self = this;
            //self.columnNamesObjs = []
            this.templates = [];
            this.showTemplates = false;

            this.$onChanges = function() {
                //self.columnNamesObjs = this.columns;
                console.log("columnTemplateDropdown cols : ", columns);

                // Get templates from server
                $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response) {
                    console.log("get templates success", response.data);
                    self.templates = response.data;
                }, function errorCallback(response) {
                    console.error("get templates failed ", response);
                });
            };

            // save template/profile for cols
            this.SaveColumnList = function(columnObjs) {
                var colObjToAdd = JSON.parse(angular.toJson(columnObjs));
                var template = {
                    "colObj": colObjToAdd,
                    "templateName": this.currTemplateName
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
            };

        } //end controller
    ]

});
