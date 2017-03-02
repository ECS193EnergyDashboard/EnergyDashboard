angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    controller: ['$filter', 'pi', function AnalysisController($filter, pi) {
        var self = this;
        this.datePicker={};
        this.datePicker.date = {startDate: null, endDate: null };
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

        this.startAnalysis = function() {
            var webId1= "E0bgZy4oKQ9kiBiZJTW7eugwHdna_ulm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAxXFJNMTEwNQ";
            var webId2='E0bgZy4oKQ9kiBiZJTW7eugwI9na_ulm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAxXFJNMTExMw';
            var startDate = self.datePicker.date.startDate.format();
            var endDate = self.datePicker.date.endDate.format();
            pi.getSummaryOfElement(webId1, startDate, endDate).then(function(response) {
                var data = [];
                var colNames = [];
                for (var element of response.elements) {
                    if (element.values) {
                        data.push(pi.tabulateValues(element));
                        colNames.push({ name: element.name, isChecked: true });
                    }
                }
                self.data.push({ name: 'Row 1', values: data });
                self.outerColumnNames = colNames;
                console.log(self.outerColumnNames);

                pi.getSummaryOfElement(webId2, startDate, endDate).then(function(response) {
                    var data = [];
                    for (var element of response.elements) {
                        if (element.values) {
                            data.push(pi.tabulateValues(element));
                        }
                    }
                    self.data.push({ name: 'Row 2', values: data });
                    console.log(self.data);
                });
            });
        };

        this.getters =  {
            value: function(index, key, element) {
                element.values[index][key].value;
            }
        };

    }]
});