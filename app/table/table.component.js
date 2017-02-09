
angular.module('tableModule').component('roomTable',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', function TableController($http){
		var self = this;	
		var rooms = [];
		var valueNames = [];

		$http.get('json/use.json').then(function(response){
			self.rooms = response.data;
			self.valueNames = self.rooms[0].Values;

		})
	}]
});


// $scope.number = 5;
// $scope.getNumber = function(num) {
//     return new Array(num);   
// }

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



