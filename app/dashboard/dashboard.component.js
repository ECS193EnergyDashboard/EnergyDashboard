
angular.module('dashboardModule').component('dashboard',{
	templateUrl: 'dashboard/dashboard.template.html',
	controller: ['pi', function TableController(pi){
		var self = this;
        this.showData = true; //show data tab
		this.data = [];
		this.loading = 0;
        this.webIds = [];

        // Function to cause binding up update
        bindLoading = (val) =>{
            this.loading = val;
        }

        // this happens on a click of the sidebar to get the data
        this.onNavigateTo = function(name, webId) {
            bindLoading(1);
            pi.getValuesOfChildren(webId).then(function(data) {
                self.data = [];
                self.webIds = [];
                console.log(data);
                for (var element of data.elements) {
                    self.data.push(pi.tabulateValues(element));
                    self.webIds.push(element.webId);
                }
                console.log("Dashboard data: ", self.data);
                // Call function Asynchronously to force bind to update
                bindLoading(0);
		    });
        }

        this.showAnalyzeTab = function() {
            this.showData = false;
        }

        this.showDataTab = function(){
            this.showData = true;
        }


        this.toggleMenu = function(){
            $("#wrapper").toggleClass("toggled");
        }
    }]
});