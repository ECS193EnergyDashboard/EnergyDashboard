angular.module('core.reduceColumn').
    factory('reduceColumn', [
        function() {
            var rc = { };

            rc.getColumn = function(tableData, columnName) {
                return tableData.map(function(row) {
                    return row[columnName];
                }).filter(function(column) {
                    return column && column.good && column.value;
                });
            }

            rc.reduce = function(column, func, initialValue) {
                return column.map(function(c) {
                    return c.value;
                }).reduce(func, initialValue);
            }

            rc.sum = function(column) {
                return rc.reduce(column, function(acc, val) {
                    return acc + val;
                }, 0);
            }

            rc.average = function(column) {
                if (column.length === 0) {
                    return 0;
                }
                return rc.sum(column) / column.length;
            }

            rc.min = function(column) {
                if (column.length === 0) {
                    return 0;
                }
                return rc.reduce(column, function(acc, val) { 
                    return Math.min(acc, val);
                }, Infinity);
            }

            rc.max = function(column) {
                if (column.length === 0) {
                    return 0;
                }
                return rc.reduce(column, function(acc, val) { 
                    return Math.max(acc, val);
                }, -Infinity);
            }

            return rc;
        }
    ]);


getReduceDebug = function() {
    return angular.element(document.body).injector().get('reduceColumn');
}