
angular.module('tableModule').component('table',{
	templateUrl: 'table/table.template.html',
	controller: ['$http', function TableController($http){
		var self = this;
		// self.orderProp = 'carrier';

		$http.get('json/table-fake.json').success(function(response){
			self.rooms = response.Rooms;

			// $scope.artists = data.artists; // response data 
			// $scope.albums = data.artists.albums; /this is where im getting trouble


		})
	}]
});






// angular.module('tableModule').component('table',{
// 	templateUrl: 'table/table.template.html',
// 	controller: function TableController($scope){
// 		$scope.rowCollection = [{
// 			firstName:"home",
// 			lastName:"poop"
// 		}, {
// 			firstName:"stewie",
// 			lastName:"poop"
// 		}];
// 	}
// });

