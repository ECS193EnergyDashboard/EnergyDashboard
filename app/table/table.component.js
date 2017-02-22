angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	bindings: {
		tableSrc: '<'
	},
	controller: [ '$filter', 'pi', function TableController($filter, pi){
		var self = this;	
		this.data = [];
		this.columnNames = [];
		this.columnNamesObjs = [];

		var defaultValues = ["ACH", "Air Flow Differential"];

		this.formatValue = function(value, decimals) {
			var decimals = decimals || 2;
			var result = "";
			if (value === undefined) {
				return "N/A";
			} else if (typeof(value.value) === "number") {
				result += $filter('number')(value.value, decimals);
				if (value.unitsAbbreviation) {
					result += " " + value.unitsAbbreviation;
				}
			} else {
				result += value.value;
			}
			return result;
		};

		this.valueStyle = function(value) {
			if (value === undefined) {
				return 'missingValue';
			} else if (value.good) {
				return 'goodValue';
			} else {
				return 'badValue';
			}
		}

		this.getters = {
			value: function(key, element) {
				return element[key].value;
			}
		};

		this.$onChanges = function() {
			if (self.tableSrc.length == 0) {
				return;
			}

			var columnSet = {};

			for (var element of self.tableSrc) {
				for (var value of element.values) {
					columnSet[value.name] = true;
				}
			}


			self.data = [];
			self.columnNamesObjs = [];

			// the following sets an array of objects for column names 
			// Because we already have the columnNames as a array we just use that to set the name
			// of the object
			self.columnNames = Object.keys(columnSet);
			for(var element of self.columnNames){
				var column = {};
				column.name = element;
				// check if the string element is in the defaultValues array
				if(defaultValues.includes(element)){
					column.isDefault = true;
					column.isChecked = true;
				}
				else{
					column.isDefault = false;
					column.isChecked = false;		
				}
				self.columnNamesObjs.push(column);
			}


	        function parseJSON(element) {
	            var values = {};

	            values.Name = element.name;
				for (var value of element.values) {
					values[value.name] = value;
				}
	            return values;
	        }

			for (var element of self.tableSrc) {
				self.data.push(parseJSON(element));
			}

			var sums = { Name: 'Total' };
			for (var column of self.columnNames) {
				sums[column] = { value: 0, good: false };
				for (var element of self.data) {
					var colVal = element[column];
					if (colVal && colVal.good) {
						var sumVal = sums[column];
						sumVal.value += colVal.value;
						if (!sumVal.good) {
							sumVal.good = true;
							sumVal.unitsAbbreviation = colVal.unitsAbbreviation;
						}
					}
				}
			}
			self.data.push(sums);
			console.log("Table data: ", self.columnNames, self.data);
		};

		// When click the columns button open or close the tab
		this.ShowColumnList = function(columnsNames){
			// just a check to make sure the button can not be clicked when there is nothing to show
			if(columnsNames.length != 0){
				document.getElementById("myDropdown").classList.toggle("show");
			}
		};

	}]
});




