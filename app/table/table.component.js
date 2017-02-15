
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	bindings: {
		tableSrc: '<'
	},
	controller: [ '$filter', function TableController($filter){

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

