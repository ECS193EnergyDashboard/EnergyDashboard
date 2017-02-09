
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', '$filter', function TableController($http){
		var self = this;	
		var rooms = [];
		var valueNames = [];

		$http.get('json/use.json').then(function(response){
			self.rooms = response.data;
			self.valueNames = self.rooms[0].Values;

		})
	}]
});


