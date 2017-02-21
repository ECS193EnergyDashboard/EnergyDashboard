angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    controller: ['$filter', 'pi', function TableController($filter, pi) {
        console.log("analysis controller");

    }]
});
