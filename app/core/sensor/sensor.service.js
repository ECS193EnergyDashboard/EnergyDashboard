angular.
    module('core.sensor').
    factory('sensor', ['$http', '$q',
        function($http, $q) {
            return {
              query: function() {
                /*
                $http.post('https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/batch', postData).then(function(data) {
                    return data;
                }, function(reason) { 
                    return {};
                });
                */
                var data = { elements: [] };
                var base = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/'
                var url = base + 'elements/E0bgZy4oKQ9kiBiZJTW7eugwLaXd-Olm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAx/elements?selectedFields=Items.Name;Items.WebId';
                return $http.get(url).then(function(response) {
                    var elements = response.data.Items;
                    var promises = [];
                    for (var i = 0; i < elements.length; i++) {
                        data.elements[i] = { name: elements[i].Name, values: [] };
                        url = base + 'streamsets/' + elements[i].WebId + '/value?selectedFields=Items.Name;Items.Value.Value;Items.Value.UnitsAbbreviation;Items.Value.Good'
                        promises.push($http.get(url));
                    }
                    return $q.all(promises).then(function(responses) {
                        for (var i = 0; i < responses.length; i++) {
                            var values = responses[i].data.Items;
                            for (value of values) {
                                // TODO: add default values
                                var v = { value: value.Value.Value, unitsAbbreviation: value.Value.UnitsAbbreviation, good: value.Value.Good };
                                if (v.value.Value !== undefined) { // Handle nested value objects
                                    v.value = v.value.Value;
                                }
                                v.name = value.Name;
                                data.elements[i].values.push(v);
                            }
                        }
                        return data;
                    });
                })
              }  
            };
        }
    ]);