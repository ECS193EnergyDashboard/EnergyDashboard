angular.module('sideNavModule').component('sideBar', {
    templateUrl: 'side-nav/side.template.html',
    controller: ['$scope', 'pi', function TableController($scope, pi) {

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';
        pi.getValuesOfChildren(webId).then(function(data) {
            $scope.buildings = data.elements;
            console.log("buildings: ", $scope.buildings);
        });

        $scope.clickElem = function(element) {
            if (element.elements == null || element.elements === undefined) {
                pi.getValuesOfChildren(element.webId).then(function(data) {
                    element.elements = data.elements;
                    console.log("clicked: " + element.name);
                    //console.log(element.name +" data", data.elements);
                });
            }

            // element does not have show property yet
            if (element.show == null || element.show === undefined) {
                element.show = true;
            } else {
                element.show = !element.show;
            }

        }

    }]
});
