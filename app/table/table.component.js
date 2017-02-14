
// angular.module('tableModule').component('roomTable',{
// 	templateUrl: 'table/table.template.html',
// 	controller: ['$http', '$filter', 'sensor', function TableController($http, $filter, sensor){
// 		var self = this;	
// 		this.rooms = [];

// 		sensor.query().then(function(data){
// 			self.rooms = data.Rooms;
//   			console.log(data);
// 		});

// 		this.getters = {
// 			value: function(room, index) {
// 				return room.Values[index].Value;
// 			}
// 		}

// 		this.formatValue = function(value, decimals) {
// 			var decimals = decimals || 2;
// 			var result = "";
// 			if (value.Good && typeof(value.Value) === "number") {
// 				result += $filter('number')(value.Value, decimals);
// 				if (value.UnitsAbbreviation) {
// 					result += " " + value.UnitsAbbreviation;
// 				}
// 			} else {
// 				result += value.Value;
// 			}
// 			return result;
// 		}

// 	}]
// });


angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', '$filter', 'sensor', '$scope', function TableController($http, $filter, sensor, $scope){

		var self = this;	
		this.rooms = [];

		sensor.query().then(function(data){
			self.rooms = data.Rooms;

  			$scope.columns = data.Rooms[0].Values;

	        $scope.rowCollection = [];


	        function parseJSON(room) {
	                var values = {}

	                for(var i=0;i<$scope.columns.length;i++){
	                	values[$scope.columns[i].Name] = self.rooms[room].Values[i].Value;
	                }
	                return values;

	        }
	        

	        for(var i=0;i<self.rooms.length;i++){
	          $scope.rowCollection.push(parseJSON(i));
	        }


		});

		this.getters = {
			value: function(room, index) {
				return room.Values[index].Value;
			}
		}

		this.formatValue = function(value, decimals) {
			var decimals = decimals || 2;
			var result = "";
			if (value.Good && typeof(value.Value) === "number") {
				result += $filter('number')(value.Value, decimals);
				if (value.UnitsAbbreviation) {
					result += " " + value.UnitsAbbreviation;
				}
			} else {
				result += value.Value;
			}
			return result;
		}



	}]
});


