angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        tableSrc: '<'
    },
    controller: ['$filter', 'pi', function TableController($filter, pi) {
        console.log("analysis controller");

    /*    for (var element of this.tableSrc) {
            self.data.push(parseJSON(element));
        }*/

    }]
});
