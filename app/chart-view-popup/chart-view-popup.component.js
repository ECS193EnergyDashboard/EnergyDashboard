angular.module('chartViewPopupModule').component('chartViewPopup', {
        templateUrl: 'chart-view-popup/chart-view-popup.template.html',
        controller: [ '$window', function($window) {
            var self = this;

            this.webIds = $window.chartOptions.webIds || [];
            this.interval = $window.chartOptions.interval || '1h';
        }]
    });