angular.
    module('core.pi').
    factory('pi', ['$http', '$q',
        function($http, $q) {
            var pi = { };
            //Count of elements created
            var eCnt = 0;

            pi.getElement = function(webId) {
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + webId + '?selectedFields=Name;WebId;HasChildren';
                return $http.get(url).then(response => {
                    return { 
                        name: response.data.Name || '', 
                        webId: response.data.WebId || '',
                        numId: eCnt++,
                        hadChildren: response.data.HasChildren || false 
                    };
                }, response => {
                    console.log('Error: getElement(): ' + response.status + ' - ' + response.statusText);
                });
            }

            pi.getValuesOfElement = function(webId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streamsets/' + webId + '/value?selectedFields=Items.Name;Items.Value.Value;Items.Value.UnitsAbbreviation;Items.Value.Good'
                return $http.get(url).then(function(response) {
                    var values = response.data.Items;
                    for (value of values) {
                        var v = { 
                            value: value.Value.Value || 0, 
                            unitsAbbreviation: value.Value.UnitsAbbreviation || '', 
                            good: value.Value.Good || false
                        };
                        if (v.value.Value !== undefined) { // Handle nested value objects
                            v.value = v.value.Value;
                        }
                        v.name = value.Name;
                        result.push(v);
                    }
                    return result;
                }, response => {
                    console.log('Error: getValuesOfElement(): ' + response.status + ' - ' + response.statusText);
                });
            };

            pi.getChildrenOfElement = function(parentWebId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + parentWebId + '/elements?selectedFields=Items.Name;Items.WebId;Items.HasChildren'
                return $http.get(url).then(function(response) {
                    var children = response.data.Items;
                    for (child of children) {
                        var c = { 
                            name: child.Name || '',
                            numId: eCnt++,
                            webId: child.WebId || '', 
                            hasChildren: child.HasChildren || false };
                        result.push(c);
                    }
                    console.log(result);
                    return result;
                }, response => {
                    console.log('Error: getChildrenOfElement(): ' + response.status + ' - ' + response.statusText);
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