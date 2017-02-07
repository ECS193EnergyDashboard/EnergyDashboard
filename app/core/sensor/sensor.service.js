var postData = {
	rooms: {
		Method: "GET",
		Resource: "https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/E0bgZy4oKQ9kiBiZJTW7eugwLaXd-Olm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAx/elements?selectedFields=Items.Name;Items.WebId"
	},
	values: {
		Method: "GET",
		RequestTemplate: {
			"Resource": "https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streamsets/{0}/value?selectedFields=Items.Value.Value;Items.Value.UnitsAbbreviation;Items.Value.Good"
		},
		Parameters: [
			"$.rooms.Content.Items[*].WebId"
		],
		ParentIds: [
			"rooms"
		]
	}
}

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
                var data = { Rooms: [] };
                var base = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/'
                var url = base + 'elements/E0bgZy4oKQ9kiBiZJTW7eugwLaXd-Olm5RGZEkhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEdIQVVTSVxTVUJTWVNURU1cQUhVXEFIVTAx/elements?selectedFields=Items.Name;Items.WebId';
                return $http.get(url).then(function(response) {
                    var rooms = response.data.Items;
                    var promises = [];
                    for (var i = 0; i < rooms.length; i++) {
                        data.Rooms[i] = { Name: rooms[i].Name, Values: [] };
                        url = base + 'streamsets/' + rooms[i].WebId + '/value?selectedFields=Items.Name;Items.Value.Value;Items.Value.UnitsAbbreviation;Items.Value.Good'
                        promises.push($http.get(url));
                    }
                    $q.all(promises).then(function(responses) {
                        for (var i = 0; i < responses.length; i++) {
                            var values = responses[i].data.Items;
                            for (value of values) {
                                var v = value.Value;
                                if (v.Value.Value !== undefined) { // Handle nested value objects
                                    v.Value = v.Value.Value;
                                }
                                console.log(v.Value);
                                v.Name = value.Name;
                                data.Rooms[i].Values.push(v);
                            }
                        }
                    });
                    return data;
                })
              }  
            };
        }
    ]);