angular.module('dashboardModule').controller("rootCtrl", ['$scope',
    function($scope) {
        $scope.showSidebar = {sidebar1: true, sidebar2: false, sidebar3: false};
        $scope.testText = "ghellow test tecxt";
        $scope.show = 0;
        $scope.loading = {sidebar: 0, data: 0, analysis: 0};
        $scope.loadingMaxs = {sidebar: 1, data: 1, analysis: 1};

        $scope.toggleSidebar = function (sidebarType) {
            $scope.showSidebar[sidebarType] = !$scope.showSidebar[sidebarType];
        };
        $scope.toggled = function (sidebarType) {
            return $scope.showSidebar[sidebarType] == true;
        };

        $scope.$watch('loading', function (newValue, oldValue) {
            var types = ['sidebar', 'data', 'analysis'];
            for (var i = 0; i < 3; i++ ) {
                console.log("Max "+types[i]+" : "+$scope.loadingMaxs[types[i]]);
                if (newValue[types[i]] > oldValue[types[i]]) {
                    $scope.loadingMaxs[types[i]] = newValue[types[i]];
                }
            }
        }, true);

        $scope.valueNow = function(type){
            var varNow = (($scope.loadingMaxs[type] - $scope.loading[type]) - 0)/ ($scope.loadingMaxs[type] - 0) * 100;
            varNow = Math.round(varNow);
            if(isNaN(varNow)){
                varNow = 0;
            }
            console.log( type + " val now :"+varNow );
            return varNow;
        };

        $scope.valueMax = function(type){
          return $scope.loadingMaxs[type];
        };
        $scope.isLoading = function(type){
            // return true;
            return ($scope.loading[type] > 0);
        };

        $scope.showFunc = function(type){
          $scope.show = type;
        };
}]);
