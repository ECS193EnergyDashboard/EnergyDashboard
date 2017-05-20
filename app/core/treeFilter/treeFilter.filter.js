angular.module('core.treeFilter').filter('treeFilter', function() {
    return function(input, searchString, key) {
        //Check if filter is disabled
        if(searchString.length == 0){
            return input;
        }

        function buildRegex(query) {
            if (query.includes('*')) {
                // Match with wildcards, case-insensitive
                return new RegExp(query.replace('*', '.*'), 'i');
            } else {
                // Match any with this substring, case-insensitive
                return new RegExp('.*' + query + '.*', 'i');
            }
        }

        function splitQuery(query) {
            // Split and remove leading and trailing whitespace from each token
            return query.split('>').map(function(s) { return s.trim(); });
        }

        function queryToRegex(query) {
            return splitQuery(query).map(buildRegex);
        }

        var regexes = queryToRegex(searchString);

        //Var to hold search results
        var out = [];
        var list = input.map(function(e) { 
            return { element: e, searchLevel: 0 };
        });
        //Iterate while queue not empty
        while(0 < list.length){
            //Get top element
            var pair = list.shift();
            var elem = pair.element;
            var searchLevel = pair.searchLevel;

            var regex = regexes[searchLevel];

            if (regex.exec(elem[key])) {
                if (searchLevel === regexes.length - 1) {
                    // Case 1: elem matches last regex, so add to output
                    out.push(elem);
                } else { 
                    // Case 2: elem matches non-last regex, so add children to list and increment their search level (if they have any)
                    if (elem.hasChildren && elem.elements) {
                        for (var e of elem.elements) {
                            list.push({ element: e, searchLevel: searchLevel + 1 });
                        }
                    }
                }
            } else {
                // Case 3: elem does not match, so add children to list with same search level (if they have any)
                if (elem.hasChildren && elem.elements) {
                    for (var e of elem.elements) {
                        list.push({ element: e, searchLevel: searchLevel });
                    }
                }
            }
        }
        return out;
    }
});