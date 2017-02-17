angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: [ '$filter', 'pi', function TableController($filter, pi){
		var self = this;	
		this.data = [];
		this.columnNames = [];

		var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwLaXd-Olm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAx';

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
			value: function(key, element) {
				return element[key].value;
			}
		}

		pi.getValuesOfChildren(webId).then(function(data){

			self.columnNames = data.elements[0].values.map(value => { return value.name; });

	        function parseJSON(element) {
	            var values = {};

	            values.Name = element.name;
				for (var value of element.values) {
					values[value.name] = value;
				}
	            return values;
	        }

			for (var element of data.elements) {
				self.data.push(parseJSON(element));
			}
		});
	}]
});


