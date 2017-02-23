angular.module('analysisModule').component('analysis', {
    templateUrl: 'analysis/analysis.template.html',
    bindings: {
        tableSrc: '<'
    },
    controller: ['$filter', 'pi', function TableController($filter, pi) {
        this.columnNamesObjs = [{
                name: "avg",
                isDefault: true,
                isChecked: true
            },
            {
                name: "max",
                isDefault: true,
                isChecked: true
            },
            {
                name: "min",
                isDefault: true,
                isChecked: true
            }, {
                name: "std dev",
                isDefault: true,
                isChecked: true
            }
        ];
        this.columnNames = this.columnNamesObjs.map(function(a) {return a.name;});

        this.startAnalysis = function(){
            // compute analysis
            //update table
        };

        /*    for (var element of this.tableSrc) {
                self.data.push(parseJSON(element));
            }*/
        this.$onChanges = function(){
            console.log("analysis tableSrc: ", this.tableSrc); //not working
        };

    }]
});
