
angular.module('tableModule').component('table',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', function TableController($http){
		var self = this;
		// self.orderProp = 'carrier';

		$http.get('json/use.json').then(function(response){
			self.rooms = response.data;
			self.values = response.data.Values;


	    // $scope.artists = [];
	    // angular.forEach(data.artists, function(value, key) {
	    //     $scope.artists.push(value);
	    // });
	    // $scope.isVisible = function(name){
	    //     return true;// return false to hide this artist's albums
	    // };

			// $scope.artists = data.artists; // response data 
			// $scope.albums = data.artists.albums; /this is where im getting trouble


		})
	}]
});


// angular.module('tableModule').component('table',{
// 	templateUrl: 'table/table.template.html',
// 	controller: ['$http', function TableController($http){
// 		var self = this;
// 		// self.orderProp = 'carrier';

// 		$http.get('json/table-fake.json').then(function(response){
// 			self.rooms = response.data;
// 			//self.values = response.Rooms.Values


// 	    // $scope.artists = [];
// 	    // angular.forEach(data.artists, function(value, key) {
// 	    //     $scope.artists.push(value);
// 	    // });
// 	    // $scope.isVisible = function(name){
// 	    //     return true;// return false to hide this artist's albums
// 	    // };

// 			// $scope.artists = data.artists; // response data 
// 			// $scope.albums = data.artists.albums; /this is where im getting trouble


// 		})
// 	}]
// });



