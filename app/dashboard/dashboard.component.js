
angular.module('dashboardModule').component('dashboard',{
	templateUrl: 'dashboard/dashboard.template.html',
	controller: ['pi', function TableController(pi){
		var self = this;
		this.data = [];
		this.loading = 0;

        // Function to cause binding up update
        bindLoading = (val) =>{
            this.loading = val;
        }

        this.onNavigateTo = function(name, webId) {
            bindLoading(1);
            pi.getValuesOfChildren(webId).then(function(data){
                self.data = data.elements;
                console.log("Dashboard data: ", self.data);
                // Call function Asynchronously to force bind to update
                bindLoading(0);
		    });
        }
	}]
});
