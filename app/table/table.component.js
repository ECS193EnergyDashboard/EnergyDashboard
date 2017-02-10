
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', '$filter', 'sensor', function TableController($http, $filter, sensor){
		var self = this;	
		this.rooms = [];

		sensor.query().then(function(data){
			self.rooms = data.Rooms;
  			console.log(data);
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

