
angular.module('dashboardModule').component('dashboard',{
	templateUrl: 'dashboard/dashboard.template.html',
	controller: ['pi', function TableController(pi){
		var self = this;
        this.showData = true; //show data tab
		this.data = [];

        this.onNavigateTo = function(name, webId) {
            pi.getValuesOfChildren(webId).then(function(data){
                self.data = data.elements;
                console.log("Dashboard data: ", self.data);
		});
        }
	}]
});
