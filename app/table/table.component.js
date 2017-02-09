
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', '$filter', 'sensor', function TableController($http, $filter, sensor){
		var self = this;	
		var rooms = [];
		var valueNames = [];

		sensor.query().then(function(data){
			self.rooms = data.Rooms;
			self.valueNames = self.rooms[0].Values;
  			console.log(data);
		});

	}]
});

