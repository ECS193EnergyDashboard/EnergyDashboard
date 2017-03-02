angular.
    module('core.pi').
    factory('pi', ['$http', '$q',
        function($http, $q) {
            var pi = { };
            //Count of elements created
            var eCnt = 0;

            pi.getElement = function(webId) {
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + webId + '?selectedFields=Name;WebId;HasChildren';
                return $http.get(url).then(function(response) {
                    return { 
                        name: response.data.Name || '', 
                        webId: response.data.WebId || '',
                        numId: eCnt++,
                        hadChildren: response.data.HasChildren || false 
                    };
                }, function(response) {
                    console.log('Error: getElement(): ' + response.status + ' - ' + response.statusText);
                });
            }

            pi.getValuesOfElement = function(webId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streamsets/' + webId + '/value?selectedFields=Items.Name;Items.WebId;Items.Value.Value;Items.Value.UnitsAbbreviation;Items.Value.Good'
                return $http.get(url).then(function(response) {
                    var values = response.data.Items;
                    for (var value of values) {
                        var v = {
                            name: value.Name,
                            value: value.Value.Value || 0, 
                            unitsAbbreviation: value.Value.UnitsAbbreviation || '', 
                            good: value.Value.Good || false,
                            webId: value.WebId
                        };
                        if (v.value.Value !== undefined) { // Handle nested value objects
                            v.value = v.value.Value;
                        }
                        result.push(v);
                    }
                    return result;
                }, function(response) {
                    console.log('Error: getValuesOfElement(): ' + response.status + ' - ' + response.statusText);
                });
            };

            pi.getChildrenOfElement = function(parentWebId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + parentWebId + '/elements?selectedFields=Items.Name;Items.WebId;Items.HasChildren'
                return $http.get(url).then(function(response) {
                    var children = response.data.Items;
                    for (var child of children) {
                        var c = { 
                            name: child.Name || '',
                            numId: eCnt++,
                            webId: child.WebId || '', 
                            hasChildren: child.HasChildren || false };
                        result.push(c);
                    }
                    return result;
                }, function(response) {
                    console.log('Error: getChildrenOfElement(): ' + response.status + ' - ' + response.statusText);
                });
            };

            pi.getValuesOfChildren = function(parentWebId) {
                var result = { elements: [] };
                return pi.getChildrenOfElement(parentWebId).then(function(children) {
                    var promises = [];
                    for (var child of children) {
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

            pi.getSummaryOfElement = function(webId, startTime, endTime) {
                /*
                var result = { elements: [] };
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streamsets/' + webId + '/summary?summaryType=Average&summaryType=Minimum&summaryType=Maximum&summaryType=StdDev'
                if (typeof(startTime) === "string" && startTime !== "") {
                    url += "&startTime=" + startTime;
                }
                if (typeof(endTime) === "string" && endTime !== "") {
                    url += "&endTime=" + endTime;
                }
                return $http.get(url).then(function(response) {
                    var items = response.data.Items;
                    for (var item of items) {
                        var element = { name: item.Name, values: [] };
                        for (var calc of item.Items) {
                            var v = { 
                                value: calc.Value.Value || 0, 
                                unitsAbbreviation: calc.Value.UnitsAbbreviation || '', 
                                good: calc.Value.Good || false
                            };
                            if (v.value.Value !== undefined) { // Handle nested value objects
                                v.value = v.value.Value;
                            }
                            v.name = calc.Type;
                            element.values.push(v);
                        }
                        result.elements.push(element);
                    }
                    return result;
                }, function(response) {
                    console.log('Error: getSummaryOfElement(): ' + response.status + ' - ' + response.statusText);
                });
                */
                var result = { elements: [] };
                return pi.getValuesOfElement(webId).then(function(response) {
                    var promises = [];
                    for (var element of response) {
                        result.elements.push({ name: element.name });
                        promises.push(pi.getSummaryOfAttribute(element.webId, startTime, endTime));
                    }
                    return $q.all(promises).then(function(responses) {
                        for (var i = 0; i < responses.length; i++) {
                            result.elements[i].values = responses[i];
                        }
                        return result;
                    });
                });
            }

            pi.getSummaryOfAttribute = function(webId, startTime, endTime) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/' + webId + '/summary?summaryType=Average&summaryType=Minimum&summaryType=Maximum&summaryType=StdDev'
                if (startTime) {
                    url += "&startTime=" + startTime;   
                }
                if (endTime) {
                    url += "&endTime=" + endTime;
                }
                return $http.get(url).then(function(response) {
                    var items = response.data.Items;
                    for (var item of items) {
                        var v = { 
                            name: item.Type,
                            value: item.Value.Value || 0, 
                            unitsAbbreviation: item.Value.UnitsAbbreviation || '', 
                            good: item.Value.Good || false
                        };
                        if (v.value.Value !== undefined) { // Handle nested value objects
                            v.value = v.value.Value;
                        }
                        result.push(v);
                    }
                    return result;
                }, function(response) {
                    console.log('Error: getSummaryOfAttribute(): ' + response.status + ' - ' + response.statusText);
                });
            }

            pi.tabulateValues = function(element) {
                var values = {};

                values.Name = element.name;
                for (var value of element.values) {
                    values[value.name] = value;
                }
                return values;
            }

            return pi;
        }
    ]);