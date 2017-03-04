angular.
    module('core.pi').
    factory('pi', ['$http', '$q',
        function($http, $q) {
            var pi = { };
            //Count of elements created
            var eCnt = 0;

            var buildingNamePrefix = 'Buildings\\\\';
            pi.buildingNameFromPath = function(path) {
                var splitPath = path.split('\\');
                var foundIndex = -1, index = 0;

                for (var pathName of splitPath) {
                    if (pathName === 'Buildings') {
                        foundIndex = index + 1;
                        break;
                    }
                    index++;
                }
                if (foundIndex === -1) {
                    return '';
                } 
                return splitPath[foundIndex];
            }

            pi.getElement = function(webId) {
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + webId + '?selectedFields=Name;WebId;HasChildren;Path';
                return $http.get(url).then(response => {
                    return { 
                        name: response.data.Name || '', 
                        webId: response.data.WebId || '',
                        numId: eCnt++,
                        hasChildren: response.data.HasChildren || false,
                        building: pi.buildingNameFromPath(response.data.Path)
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
                    for (var value of values) {
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
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + parentWebId + '/elements?selectedFields=Items.Name;Items.WebId;Items.HasChildren;Items.Path'
                return $http.get(url).then(function(response) {
                    var children = response.data.Items;
                    var building = children.length > 0 ? pi.buildingNameFromPath(children[0].Path) : '';
                    for (var child of children) {
                        var c = { 
                            name: child.Name || '',
                            numId: eCnt++,
                            webId: child.WebId || '', 
                            hasChildren: child.HasChildren || false,
                            building: building
                        };
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

            pi.tabulateValues = function(element) {
                var values = {};

                values.name = element.name;
                values.building = element.building;
                for (var value of element.values) {
                    values[value.name] = value;
                }
                return values;
            }

            pi.getTemplates = function() {
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/assetdatabases/D0bgZy4oKQ9kiBiZJTW7eugw57M0LxpH1kyB4TSsSWDrYgVVRJTC1BRlxBQ0U/elementtemplates?selectedFields=Items.Name';
                var result = [];
                return $http.get(url).then(function(response) {
                    for (var element of response.data.Items) {
                        result.push(element.Name);  
                    }
                    return result;
                }, function(response) {
                    console.log('Error: getTemplates(): ' + response.status + ' - ' + response.statusText);  
                })
            }

            pi.getElementsWithTemplate = function(templateName) {
                rootWebId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + rootWebId + '/elements?templateName=' + templateName + '&searchFullHierarchy=true&selectedFields=Items.Name;Items.WebId;Items.HasChildren;Items.Path';
                var result = [];
                return $http.get(url).then(function(response) {
                    for (var element of response.data.Items) {
                        var e = { 
                            name: element.Name || '',
                            numId: eCnt++,
                            webId: element.WebId || '', 
                            hasChildren: element.HasChildren || false, 
                            building: pi.buildingNameFromPath(element.Path)
                        };
                        result.push(e);
                    }

                    return result;
                }, function(response) {
                    console.log('Error: getElementsWithTemplate(): ' + response.status + ' - ' + response.statusText);  
                })
            }

            return pi;
        }
    ]);

    getPiDebug = function() {
        return angular.element(document.body).injector().get('pi');
    }
    