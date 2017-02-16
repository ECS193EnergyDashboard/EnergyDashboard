
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
	controller: ['$http', '$filter', 'pi', function TableController($http, $filter, pi){
		var self = this;	
		this.rooms = [];

		var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwLaXd-Olm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAx';


		function formatValue(value, decimals) {
			var decimals = decimals || 2;
			var result = "";
			if (value.good && typeof(value.value) === "number") {
				result += $filter('number')(value.value, decimals);
				if (value.unitsAbbreviation) {
					result += " " + value.unitsAbbreviation;
				}
			} else {
				result += value.value;
			}
			return result;
		};

		this.getters = {
			value: function(index, element) {
				return element.values[index].value;
			}
		}

		pi.getValuesOfChildren(webId).then(function(data){

			self.rooms = data.elements;

			self.columns = self.rooms[0].values;


	        self.rowCollection = [];


	        function parseJSON(room) {
	            var values = {}

	            values["RoomNumber"] = self.rooms[room].name;
	            for(var i=0;i<self.columns.length;i++){
	            	values[self.columns[i].name] = formatValue(self.rooms[room].values[i]);
	            }
	            return values;
	        }
	        
	        for(var i=0;i<self.rooms.length;i++){
	          self.rowCollection.push(parseJSON(i));
	        }

		});


	}]
});


