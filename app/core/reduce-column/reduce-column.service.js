angular.module('core.reduceColumn').
    factory('reduceColumn', [
        function() {
            var rc = { };

            function isValid(column) {
                return column && column.good && column.value;
            }

            rc.reduce = function(column, func, initialValue) {
                return column.filter(isValid).map(function(c) {
                    return c.value;
                }).reduce(func, initialValue);
            }

            rc.sum = function(column) {
                return rc.reduce(column, function(acc, val) {
                    return acc + val;
                }, 0);
            }

            rc.average = function(column) {
                var good = column.filter(isValid);
                return good.length === 0 ? 0 : rc.sum(column) / good.length;
            }

            rc.min = function(column) {
                result =  rc.reduce(column, function(acc, val) { 
                    return Math.min(acc, val);
                }, Infinity);
                return result === Infinity ? 0 : result;
            }

            rc.max = function(column) {
                var result = rc.reduce(column, function(acc, val) { 
                    return Math.max(acc, val);
                }, -Infinity);
                return result === -Infinity ? 0 : result;
            }

            return rc;
        }
    ]);


getReduceDebug = function() {
    return angular.element(document.body).injector().get('reduceColumn');
}