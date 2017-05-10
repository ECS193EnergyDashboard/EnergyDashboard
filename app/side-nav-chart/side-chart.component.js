angular.module('sideNavChartModule').component('sideBarChart', {
    templateUrl: 'side-nav-chart/side-chart.template.html',
    bindings: {
        selection: '<'
    },
    controller: [ 'pi', function TableController(pi) {
        var self = this;
        var dummyItem = {
            building: '',
            hasChildren: false,
            name: '',
            numId: -1,
            template: '',
            webId: ''
        };
        this.selected = [ dummyItem ];

        // Copies everything but the dummy. Used to shallow copy the list for callbacks.
        this.copySelected = function() {
            return this.selected.slice(0, this.selected.length - 1);
        };

        this.removeChartElement = function (element)   {
            this.selection.splice(this.selection.indexOf(element), 1);


        };

        this.clearSelected = function() {
            this.selection.length = 0;
        };


    }]
});
