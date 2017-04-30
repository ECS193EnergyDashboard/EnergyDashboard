angular.module('modalsModule').component('modals', {
    templateUrl: 'modals/modals.template.html',
    bindings: {
        templateType:       '<',
        templateColumns:    '<',
        setTemplate:        '&',
        templateToDelete:    '<'
    },
    controller: ['$scope', '$http', function TableController($scope, $http) {
        var self = this;
        this.templates = [];


        this.$onChanges = function() {
            this.getTemplates();
        }; //end $onChanges



        // We need to get the tempaltes to check if save as or save
        this.getTemplates = function(){
            // Get templates from server
            $http({method: 'GET', url: '/getTemplates'}).then(function successCallback(response) {
                //console.log("get templates success", response.data);
                self.templates = response.data;
                
            }, function errorCallback(response) {
                console.error("get templates failed ", response);
            });
        };


        // Save template/profile for cols
        // Called in html with $ctrl.columns
        this.saveTemplate = function() {
            this.getTemplates(); // update template array   
            // Check to make sure template is not named default or name is already taken
            if(this.newTemplateName == "Default"){
                $("#templateNameErrorModal").modal('show');
                return;
            }
            for(temp of this.templates){
                // New template name already exists and its type is the current type
                if(this.newTemplateName == temp.name && temp.type == this.templateType){
                    $("#templateNameConflictModal").modal('show');
                    return;
                }
            }

            var colObjToAdd = JSON.parse(angular.toJson(this.templateColumns)); // Make clone

            var template = {
                "name": this.newTemplateName,
                "colObj": colObjToAdd,
                "type": this.templateType,
                "isDefault": "false"
            };

            $("#newTempModal").modal('hide');
            $("#templateInput").val(''); // clear the inputbox

            this.postTemplate(template);
            this.setTemplate({template: template});
        }; // end saveTemplate


        // POST template/profile to server
        this.postTemplate = function(template){
            console.log(template);   
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
        } // end postTemplate


        this.deleteTemplate = function(){
            var template = {
                "name": this.templateToDelete.name,
                "type": this.templateToDelete.type,
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

            $('.modal-backdrop').remove(); // Hard remove backdrop - HOT FIX

        };


        // A function to overwrite the template on the server
        this.overwriteTemplate = function(){
            var oldTemplate = {
                "name": this.newTemplateName,
                "type": this.templateType,
            };
            $http({
                method: 'POST',
                url: '/templatesDelete',
                data: angular.toJson(oldTemplate),
            }).then(function successCallback(response) {
                console.log("POST Templates Success");
                document.getElementById("templateInput").value = "";
            }, function errorCallback(response) {
                console.error("POST Failed ", response);
            });

            this.saveTemplate();
            $("#newTempModal").modal('hide');
            $("#templateInput").val(''); // clear the inputbox
        };








    }] // end TableController


});




// TODO:: CLEAR TEXT BOX
