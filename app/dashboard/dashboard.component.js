// angular.module('dashboardModule').component('dashboard', {
//     templateUrl: 'dashboard/dashboard.template.html',
//     controller: [
//         'pi',
//         function TableController(pi) {
//             var self = this;
//             this.showData = true; //show data tab
//             this.data = [];
//             this.isLoading = {
//                 sidebar: 0,
//                 data: 0,
//                 analysis: 0
//             };
//             this.webIds = [];
//             this.name = "";
// 
// <<<<<<< HEAD
//             // Function to cause binding up update
//             bindIsLoading = (name, val) => {
//                 this.isLoading[name] = val;
//             }
// 
//             // this happens on a click of the sidebar to get the data
//             this.onNavigateTo = function(name, webId) {
//                 this.name = name;
//                 bindIsLoading("data", 1);
//                 pi.getValuesOfChildren(webId).then(function(data) {
//                     self.data = [];
//                     self.webIds = [];
//                     console.log(data);
//                     for (var element of data.elements) {
//                         self.data.push(pi.tabulateValues(element));
//                         self.webIds.push(element.webId);
//                     }
//                     console.log("Dashboard data: ", self.data);
//                     // Call function Asynchronously to force bind to update
//                     bindIsLoading("data", 0);
//                 });
//             }
// 
//             this.showAnalyzeTab = function() {
//                 this.showData = false;
//             }
// 
//             this.showDataTab = function() {
//                 this.showData = true;
//             }
// 
//             this.toggleMenu = function() {
//                 $("#wrapper").toggleClass("toggled");
//             }
//             this.toggleSelectorMenu = function() {
//                 $("#wrapper").toggleClass("toggledSelector");
//             }
//         }
//     ]
// });
// =======
angular.module('dashboardModule').component('dashboard',{
	templateUrl: 'dashboard/dashboard.template.html',
	controller: ['pi', function TableController(pi){
		var self = this;
        this.show = 0;
		this.data = [];
		this.showData = true;
		this.asyncData = [];
        this.cancelAysnc = false;
        this.webIds = [];
        this.itemsToAdd = [];
		this.loading = { sidebar: 0, data: 0, analysis: 0 };
        this.chartSelection = [];
        this.elemName = "";

        // Increments and decrements the loading binding, like a semaphore
        // Example: multiple async requests, each one UPs when sent, each one DOWNs when done, 0 signals loading is done
        this.loadingUp = function(name) {
            this.loading[name]++;
        }

        this.loadingDown = function(name) {
            if (this.loading[name] > 0) {
                this.loading[name]--;
            }
        }

        this.isLoading = function(name) {
            return this.loading[name] > 0;
        };

        this.addChildElements = function(parent) {
            this.itemsToAdd = parent.elements;
            this.elemName = parent.name;
        }

        this.addElement = function(element) {
            this.loadingUp('data');

            this.webIds.push(element.webId);

            var loadedData = [];
            var index = this.asyncData.length;
            this.asyncData.push({ });

            pi.getValuesOfElements([ element.webId ]).then(function(data) {
                if (!self.cancelAysnc) {
                    self.asyncData[index] = pi.tabulateValues(data[0]);
                }

                self.loadingDown('data');

                if (!self.isLoading('data')) {
                    Array.prototype.push.apply(self.data, self.asyncData);
                    self.asyncData = [];
                    self.cancelAysnc = false;

                    self.data = self.data.slice();
                }
            });
        }

        this.removeElement = function(element) {
            var index = this.webIds.indexOf(element.webId);
            this.webIds.splice(index, 1);
            this.data.splice(index, 1);

            this.data = this.data.slice();
        }

        this.clearElements = function() {
            this.webIds.length = 0;
            this.data.length = 0;

            if (this.isLoading('data')) {
                this.cancelAysnc = true;
                this.asyncData = [];
            }
        }

        this.showDataTab = function() {
            this.show = 0;
        }

        this.showAnalyzeTab = function() {
            this.show = 1;
        }

        this.showGraphTab = function() {
            this.show = 2;
        }

        this.isDataTabShown = function() {
            return this.show === 0;
        }

        this.isAnalyzeTabShown = function() {
            return this.show === 1;
        }

        this.isGraphTabShown = function() {
            return this.show === 2;
        }


        this.toggleMenu = function(){
            $("#wrapper").toggleClass("toggled");
        };
        this.toggleSelectorMenu = function(){
            $("#wrapper").toggleClass("toggledSelector");
        };
        this.toggleChartMenu = function(){
            $("#wrapper").toggleClass("toggledChart");
        };
    }]
});
// >>>>>>> master
