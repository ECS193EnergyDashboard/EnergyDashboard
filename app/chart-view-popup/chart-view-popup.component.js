angular.module('chartViewPopupModule').component('chartViewPopup', {
        templateUrl: 'chart-view-popup/chart-view-popup.template.html',
        controller: [ '$location', function($location) {
            var self = this;

            var params = $location.search();

            this.config = {
                webIds: (Array.isArray(params.webId) ? params.webId : [ params.webId ]) || [],
                interval: params.interval || '1h',
                yAxisName: params.yAxis,
                title: params.title
            };
        }]
    });