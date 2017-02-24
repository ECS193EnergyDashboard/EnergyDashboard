angular.module('dashboardModule').component('dashboard', {
    templateUrl: 'dashboard/dashboard.template.html',
    controller: ['pi', function TableController(pi) {
        var self = this;
        this.showData = true; //show data tab
        this.data = [];
        this.analysisData = [];
        // this.analysisWebID = [];

        // this happens on a click of the sidebar to get the data
        this.onNavigateTo = function(name, webId) {
            pi.getValuesOfChildren(webId).then(function(data) {
                self.data = [];
                for (var element of data.elements) {
                    self.data.push(pi.tabulateValues(element));
                }
                console.log("Dashboard data: ", self.data);
            });
        }

        this.showAnalyzeTab = function() {
            this.analysisData = self.data;
            // this.analysisWebID = webId;
            this.showData = false;
            // console.log(this.analysisWebID);
            
        }

        this.showDataTab = function(){
            this.showData = true;
        }


        this.toggleMenu = function(){
            $("#wrapper").toggleClass("toggled");
        }
    }]
});
