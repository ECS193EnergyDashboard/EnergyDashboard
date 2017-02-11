
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', '$filter', 'sensor', function TableController($http, $filter, sensor){
		var self = this;	
		this.data = [];

		sensor.query().then(function(data){
			self.data = data.elements;
  			console.log(self.data);
		});

		this.formatValue = function(value, decimals) {
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

	}]
});

