angular.module('columnTemplateDropdownModule').component('columnTemplateDropdown', {
    templateUrl: 'column-template-dropdown/column-template-dropdown.template.html',
    bindings: {
        columns: '<',
        templateSets: '<'
    },
    controller: ['$scope', function TableController($scope) {
        var self = this;
        self.columnNamesObjs = []

        this.$onChanges = function() {
            self.columnNamesObjs = this.columns;
        };



        

    }]

});


