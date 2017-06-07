angular.
    module('core.pi').
    factory('pi', ['$http', '$q',
        function($http, $q) {
            var pi = {};
            //Count of elements created
            var eCnt = 0;

            var buildingNamePrefix = 'Buildings\\\\';
            pi.buildingNameFromPath = function(path) {
                var splitPath = path.split('\\');
                var foundIndex = -1, index = 0;
                var regex = /Buildings/;
                for (var str of splitPath) {
                    if (regex.exec(str)) {
                        foundIndex = index;
                    }
                    index++;
                }
                if (foundIndex === -1 || foundIndex === splitPath.length - 1) {
                    return '';
                } 
                return splitPath[foundIndex + 1];
            }

            pi.getElement = function(webId) {
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + webId + '?selectedFields=Name;WebId;TemplateName;HasChildren;Path';
                return $http.get(url).then(function(response) {
                    return { 
                        name: response.data.Name || '', 
                        webId: response.data.WebId || '',
                        //tag: response.data.
                        template: response.data.TemplateName || 'none',
                        numId: eCnt++,
                        hasChildren: response.data.HasChildren || false,
                        building: pi.buildingNameFromPath(response.data.Path)
                    };
                }, function(response) {
                    console.log('Error: getElement(): ' + response.status + ' - ' + response.statusText);
                });
            }

            pi.getAttribute = function(webId) {
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/attributes/' + webId + '?selectedFields=Name;WebId;Links.Element'; 
                return $http.get(url).then(function(response) {
                    var attrib = {
                        name: response.data.Name || '',
                        webId: response.data.WebId || ''
                    }
                    var regex = /elements\/(\S+)/g;
                    var match = regex.exec(response.data.Links.Element);
                    var elementWebId = match[1];
                    return pi.getElement(elementWebId).then(function(response) {
                        attrib.element = response;
                        return attrib;
                    });
                }, function(response) {
                    console.log('Error: getAttrib(): ' + response.status + ' - ' + response.statusText);
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

            pi.getValuesOfElements = function(webIds) {
                var result = [];
                var promises = [];
                for (var webId of webIds) {
                    promises.push(pi.getElement(webId));
                    promises.push(pi.getValuesOfElement(webId));
                }
                return $q.all(promises).then(function(responses) {
                    for (var i = 0; i < responses.length; i += 2) {
                        var element = responses[i];
                        element.values = responses[i + 1];
                        result.push(element);
                    }
                    return result;
                });
            }


            pi.getChildrenOfElement = function(parentWebId) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/' + parentWebId + '/elements?selectedFields=Items.Name;Items.WebId;Items.TemplateName;Items.HasChildren;Items.Path'
                return $http.get(url).then(function(response) {
                    var children = response.data.Items;
                    for (var child of children) {
                        var c = { 
                            name: child.Name || '',
                            numId: eCnt++,
                            template: child.TemplateName || 'none',
                            webId: child.WebId || '', 
                            hasChildren: child.HasChildren || false,
                            building: pi.buildingNameFromPath(child.Path)
                        };
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
                var result = { name: '', building: '', values: [] };
                return pi.getValuesOfElement(webId).then(function(response) {
                    var promises = [];
                    promises.push(pi.getElement(webId));
                    for (var element of response) {
                        result.values.push({ name: element.name });
                        promises.push(pi.getSummaryOfAttribute(element.webId, startTime, endTime));
                    }
                    return $q.all(promises).then(function(responses) {
                        result.name = responses[0].name;
                        result.building = responses[0].building;
                        for (var i = 1; i < responses.length; i++) {
                            result.values[i - 1].values = responses[i];
                        }
                        return result;
                    });
                });
            }

            pi.getSummaryOfElements = function(webIds, startTime, endTime) {
                var result = [];
                var promises = [];
                for (var webId of webIds) {
                    promises.push(pi.getSummaryOfElement(webId, startTime, endTime));
                }
                return $q.all(promises).then(function(responses) {
                    for (var i = 0; i < responses.length; i++) {
                        result[i] = responses[i];
                    }
                    return result;
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

            pi.getInterpolatedOfAttribute = function(webId, interval, startTime, endTime) {
                var result = [];
                var url = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/' + webId + '/interpolated?selectedFields=Items.UnitsAbbreviation;Items.Timestamp;Items.Value;Items.Good';
                if (startTime) {
                    url += "&startTime=" + startTime;   
                }
                if (endTime) {
                    url += "&endTime=" + endTime;
                }
                if (interval) {
                    url += "&interval=" + interval;
                }
                return $http.get(url).then(function(response) {
                    var items = response.data.Items;
                    for (var item of items) {
                        var v = { 
                            timestamp: new Date(item.Timestamp),
                            value: item.Value || 0, 
                            good: item.Good || false
                        };
                        if (v.value.Value !== undefined) { // Handle nested value objects
                            v.value = v.value.Value;
                        }
                        result.push(v);
                    }
                    return result;
                }, function(response) {
                    console.log('Error: getInterpolatedOfAttribute(): ' + response.status + ' - ' + response.statusText);
                });            
            }

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
    