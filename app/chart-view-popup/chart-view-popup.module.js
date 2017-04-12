'use strict';

angular.module('chartViewPopupModule', [ 'chartViewModule' ])
    .config([ '$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);