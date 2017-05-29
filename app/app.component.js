angular.module('dashboardModule').controller("rootCtrl", ['$scope',
    function($scope){
        $scope.showSidebar = {sidebar1: true, sidebar2: false, sidebar3: false};
        $scope.testText = "ghellow test tecxt";
        $scope.show = 0;

        $scope.toggleSidebar = function(sidebarType){
            $scope.showSidebar[sidebarType] = !$scope.showSidebar[sidebarType];
            // $("#wrapper").toggleClass(sidebarType);
            // this.dataTable.update();
        };
        $scope.toggled = function(sidebarType){
            return $scope.showSidebar[sidebarType] == true;
        };

        $scope.showFunc = function(type){
          $scope.show = type;
        };
}]);
