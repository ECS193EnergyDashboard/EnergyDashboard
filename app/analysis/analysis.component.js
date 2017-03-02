angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    controller: ['$filter', 'pi', function AnalysisController($filter, pi) {
        var self = this;
        this.datePicker={};
        this.datePicker.date = {startDate: null, endDate: null};
        this.data = [];

        this.outerColumnNames = [];
        this.innerColumnNames = [
            {
                name: "Average",
                isChecked: true
            },
            {
                name: "Maximum",
                isChecked: true
            },
            {
                name: "Mininum",
                isChecked: true
            }, {
                name: "StdDev",
                isChecked: true
            }
        ];

        this.startAnalysis = function(){
            var webId = "E0bgZy4oKQ9kiBiZJTW7eugwHdna_ulm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAxXFJNMTEwNQ";
            pi.getSummaryOfElement(webId).then(function(response) {
                var data = [];
                colNames = [];
                for (var element of response.elements) {
                    if (element.values) {
                        data.push(pi.tabulateValues(element));
                        colNames.push({ name: element.name, isChecked: true });
                    }
                }
                self.data = data;
                self.outerColumnNames = colNames;
                console.log(self.outerColumnNames);
                console.log(self.data);
            });
        };

    }]
});