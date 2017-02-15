
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
	controller: ['$http', '$filter', 'sensor', function TableController($http, $filter, sensor){

		//Function to formate the values with their units
		function formatValue(value, decimals) {
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


		var self = this;	
		this.rooms = [];

		// Use sensor to query for the data
		sensor.query().then(function(data){
			self.rooms = data.Rooms;

			// Columns variable used just in javascript
			columns = self.rooms[0].Values;

	        self.rowCollection = [];


	        function parseJSON(room) {
	            var values = {}

	            values["RoomNumber"] = self.rooms[room].Name;
	            for(var i=0;i<columns.length;i++){
	            	values[columns[i].Name] = formatValue(self.rooms[room].Values[i]);
	            }
	            return values;
	        }
	        
	        for(var i=0;i<self.rooms.length;i++){
	          self.rowCollection.push(parseJSON(i));
	        }


		});


		// Getter function
		this.getters = {
			value: function(room, index) {
				return room.Values[index].Value;
			}
		}
		

	}]
});


