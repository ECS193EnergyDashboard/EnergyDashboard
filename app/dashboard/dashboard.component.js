angular.module('dashboardModule').component('dashboard',{
	templateUrl: 'dashboard/dashboard.template.html',
    bindings: {
        showSidebar: '=',
        show: '='
    },
	controller: ['pi', function TableController(pi){
		var self = this;
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
        };

        this.loadingDown = function(name) {
            if (this.loading[name] > 0) {
                this.loading[name]--;
            }
        };

        this.isLoading = function(name) {
            return this.loading[name] > 0;
        };

        this.addChildElements = function(parent) {
            this.itemsToAdd = parent.elements;
            this.elemName = parent.name;
        };

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
        };

        this.showDataTab = function() {
            self.show = 0;
            // this.dataTable.update();
        };

        this.showAnalyzeTab = function() {
            self.show = 1;
            // this.dataTable.update();
        };

        this.showGraphTab = function() {
            self.show = 2;
            // this.dataTable.update();
        };

        this.isDataTabShown = function() {
            return self.show === 0;
            // this.dataTable.update();
        };

        this.isAnalyzeTabShown = function() {
            return self.show === 1;
            // this.dataTable.update();
        };

        this.isGraphTabShown = function() {
            return self.show === 2;
            // this.dataTable.update();
        };


        this.toggleMenu = function(){
            $("#wrapper").toggleClass("toggled");
            this.dataTable.update();
        };
        this.toggleSelectorMenu = function(){
            $("#wrapper").toggleClass("toggledSelector");
            this.dataTable.update();
        };
        this.toggleChartMenu = function(){
            $("#wrapper").toggleClass("toggledChart");
            this.dataTable.update();
        };



        /* @Note: not sure e.pageX will work in IE8 */
        (function(window){

            /* A full compatability script from MDN: */
            var supportPageOffset = window.pageXOffset !== undefined;
            var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

            /* Set up some variables  */
            var dataTableHead = document.getElementById("dataTableHead");
            //var demoItem3 = document.getElementById("demoItem3");
            /* Add an event to the window.onscroll event */
            window.addEventListener("scroll", function(e) {
                console.log("SCROLLED");
                /* A full compatability script from MDN for gathering the x and y values of scroll: */
                var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
                var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

                dataTableHead.style.left = -x + 50 + "px";
                //demoItem3.style.top = -y + 50 + "px";
            });

        })(window);
    }]
});
