angular.
    module('core.pi').
    factory('pi', ['$http', '$q',
        function($http, $q) {
            var pi = { };

            // TODO: error handling for all http requests

            pi.getElement = function(webId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + webId + '?selectedFields=Name;WebId;HasChildren'
                return $http.get(url).then(function(response) {
                    return{ name: response.data.Name, webId: response.data.WebId, hadChildren: response.data.HasChildren };
                });
            }

            pi.getValuesOfElement = function(webId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streamsets/' + webId + '/value?selectedFields=Items.Name;Items.Value.Value;Items.Value.UnitsAbbreviation;Items.Value.Good'
                return $http.get(url).then(function(response) {
                    var values = response.data.Items;
                    for (value of values) {
                        // TODO: add default values
                        var v = { value: value.Value.Value, unitsAbbreviation: value.Value.UnitsAbbreviation, good: value.Value.Good };
                        if (v.value.Value !== undefined) { // Handle nested value objects
                            v.value = v.value.Value;
                        }
                        v.name = value.Name;
                        result.push(v);
                    }
                    return result;
                });
            };

            pi.getChildrenOfElement = function(parentWebId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + parentWebId + '/elements?selectedFields=Items.Name;Items.WebId;Items.HasChildren'
                return $http.get(url).then(function(response) {
                    var children = response.data.Items;
                    for (child of children) {
                        // TODO: add default values
                        var c = { name: child.Name, webId: child.WebId, hasChildren: child.HasChildren };
                        result.push(c);
                    }
                    return result;
                });
            };

            pi.getValuesOfChildren = function(parentWebId) {
                var result = { elements: [] };
                return pi.getChildrenOfElement(parentWebId).then(function(children) {
                    var promises = [];
                    for (child of children) {
                        result.elements.push(child);
                        promises.push(pi.getValuesOfElement(child.webId));
                    }
                    return $q.all(promises).then(function(responses) {
                        for (var i = 0; i < responses.length; i++) {
                            result.elements[i].values = responses[i];
                        }
                        return result;
                    });
                });
            };

            return pi;
        }
    ]);