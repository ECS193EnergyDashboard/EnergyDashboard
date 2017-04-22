'use strict';

angular.module('chartViewModule', [ 'nvd3', 'core', 'daterangepicker' ])
    .config([ '$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);