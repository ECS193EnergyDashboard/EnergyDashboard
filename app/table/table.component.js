
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', '$filter', 'pi', function TableController($http, $filter, pi){
		var self = this;	
		this.data = [];

		var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwLaXd-Olm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAx';

		pi.getValuesOfChildren(webId).then(function(data){
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

