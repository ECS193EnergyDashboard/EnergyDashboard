
angular.module('sideNavModule').component('sideBar',{
	templateUrl: 'side-nav/side.template.html',
    controller: ['$scope', 'pi', function TableController($scope, pi){

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';
        pi.getValuesOfChildren(webId).then(function(data){
			$scope.buildings = data.elements;
  			console.log("buildings: ", $scope.buildings);
		});


	}]
});
