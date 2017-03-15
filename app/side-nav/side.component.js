angular.module('sideNavModule').component('sideBar', {
    templateUrl: 'side-nav/side.template.html',
    bindings: {
        isLoading: '<',
        onClick: '&'
    },
    controller: ['pi','treeFilterFilter', function TableController(pi, treeFilterFilter) {
        var self = this;
        // Highlighted Item Index
        self.hlIndex = -1;
        self.searchPlaceHolder = "Search names...";
        self.filter= "name";
        self.search = {name:'', template:''};
        self.searchInput = {name:'', template:''};
        self.filteredItems = {};
        self.buildings = [];
        self.elemList = [];
        self.filteredItems = self.buildings;
        self.templateList = [];

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';


        // Controller constructor called after bindings initialized
        self.$onInit = function() {
            //Populates building names
            pi.getChildrenOfElement(webId).then(function(data) {
                //@TODO REMOVE DEBUGGING ONLY SLICE
                //self.buildings = data.slice(0,10);
                self.buildings = data;

                //Loop through each building
                self.buildings.forEach( function(elem) {
                    self.elemList.push(elem);
                    //Recursively explore buildings directory
                    self.exploreElem(elem);
                });
                console.log("buildings: ", self.buildings);
                self.filteredItems = self.buildings;
            });
        };


        this.clearFilter = function() {
               this.searchInput[this.filter] = "";
               this.applyFilter();
        };

        this.applyFilter = function() {
            console.log("Copying search");
            //this.search.name = this.searchInput.name;
            //this.search.template = this.searchInput.template;
            self.filteredItems = treeFilterFilter(self.buildings, self.searchInput, self.filter);
        };

        //Recursively visits all of an elents childrens
        this.exploreElem = function(element) {
            self.templateList.push(element.template);
            if (element.hasChildren && (element.elements === undefined || element.elements == null )) {
                pi.getChildrenOfElement(element.webId).then(function(data) {
                    element.elements = data;

                    //console.log("clicked: " + element.name);

                    element.elements.forEach( function(elem) {
                        self.elemList.push(element);
                        self.exploreElem(elem);
                    });
                    //console.log(element.name +" data", data.elements);
                });
            }
        };

        this.clickElem = function(element) {
            /*
            if (element.elements === undefined || element.elements == null ) {
                pi.getChildrenOfElement(element.webId).then(function(data) {
                    element.elements = data;
                    console.log("clicked: " + element.name);
                    //console.log(element.name +" data", data.elements);
                });
            }
            */

            // element does not have show property yet
            if (element.show == null || element.show === undefined) {
                element.show = true;
            } else {
                element.show = !element.show;
            }
        };



        this.onSelectElem = function(element) {
            self.onClick({ name: element.name, webId: element.webId });

            //Set highlighted item index to elements id
            self.hlIndex = element.numId;
        };

        // Functions to evaluate conditions for showing/hiding certain icons/classes
        this.isSelectedElem= function(e) {
            return (e.numId == self.hlIndex);
        };

        this.elemIsLoading = function(e) {
            return ((e.numId == self.hlIndex) && self.isLoading['data']);
        };

        this.showLeafNodeIcon = function(e) {
            return (!e.hasChildren );
        };

        this.showClosedIcon = function(e) {
            return (e.hasChildren && !e.show );
        };

        this.showOpenIcon = function(e) {
            return (e.hasChildren && e.show );
        };
        this.searchNames = function(){
            self.filter = "name";
            self.searchPlaceHolder = "Search names...";
        };
        /*
        this.searchTags = function(){
            console.log(self.search.name);
            self.filter = "tag";
            self.searchPlaceHolder = "Search Tags...";
        };
        */
        this.searchTemplates = function(){
            self.filter = "template";
            self.searchPlaceHolder = "Search Templates...";
            console.log(Array.from(new set(self.templateList)));

        };

    }]
});
