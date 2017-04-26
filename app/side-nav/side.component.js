angular.module('sideNavModule').component('sideBar', {
    templateUrl: 'side-nav/side.template.html',
    bindings: {
        isLoading: '<',
        onClick: '&'
    },
    controller: ['pi','treeFilterFilter', '$scope', function TableController(pi, treeFilterFilter, $scope) {
        var self = this;
        // Highlighted Item Index
        self.hlIndex = -1;
        self.searchPlaceHolder = "Search names...";
        self.filterType= "name";
        self.search = {name:'', template:''};
        self.searchInput = {name:'', template:''};
        self.filteredItems = {};
        self.buildings = [];
        self.filteredItems = self.buildings;
        self.templateList = [];
        self.loadingElems = 0;

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';

        // Controller constructor called after bindings initialized
        self.$onInit = function() {
            //Populates building names
            this.getChildren(webId, function(data) {
                //DEBUGGING ONLY SLICEwhy
                //self.buildings = data.slice(0,10);
                //Store data in buildings array
                self.buildings = data;

                //Loop through each building
                self.buildings.forEach( function(elem) {
                    //Recursively explore buildings directory
                    self.exploreElem(elem); //self.exploreElem(elemList, elem)
                });
                //console.log("buildings: ", self.buildings);
                //Set buildings as default navigation in sidebar
                self.filteredItems = self.buildings;
            });
        };

        //Wrapper for pi getChildrenOfElement service
        this.getChildren = function(webId, func) {
            //Increment load count
            self.loadingElems++;
            pi.getChildrenOfElement(webId).then( function(data){
                func(data);
                self.loadingElems--;
                //Decrement load count
                if(self.loadingElems === 0){
                    console.log("Done loading");

                    console.log(self.templateList);
                }
            });
        };

        //Clears the filtered list
        this.clearFilter = function() {
               this.searchInput[this.filterType] = "";
               this.applyFilter();
        };

        //Applies the typed in filter
        this.applyFilter = function() {
            console.log("Applying Filter");
            console.log(self.filterType);
            console.log(self.searchInput);
            console.log(self.filteredItems);
            self.filteredItems = treeFilterFilter(self.buildings, self.searchInput, self.filterType);
        };

        //Recursively visits all of an elements children
        this.exploreElem = function(element) {
            //Search for existing template
            var found = self.templateList.find( function(e){

                return e.name === element.template;
            });

            //If template not found
            if(found === undefined){
                //Make an element for the template
                var tempElem = {name: element.template, hasChildren: true, elements: []};
                self.templateList.push(tempElem);
                found = tempElem;
            }
            //Make element child of template
            found.elements.push(element);


            //If element has children, but children have not been explored
            if (element.hasChildren && (element.elements === undefined || element.elements == null )) {
                //Get children of element

                this.getChildren(element.webId, function(data) {
                    //Add children to elements array
                    element.elements = data;

                    //Explore each child
                    element.elements.forEach( function(elem) {
                        self.exploreElem(elem);
                    });
                });
            }
        };

        this.clickElem = function(element) {
            // element does not have show property yet
            if (element.show == null || element.show === undefined) {
                element.show = true;
            } else {
                element.show = !element.show;
            }

        };


        this.onSelectElem = function(element) {
            self.onClick({ element: element });

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
            self.filterType = "name";
            self.searchPlaceHolder = "Search names...";
            self.filteredItems = self.buildings;
        };
        /*
        this.searchTags = function(){
            console.log(self.search.name);
            self.filterType = "tag";
            self.searchPlaceHolder = "Search Tags...";
        };
        */
        this.searchTemplates = function(){
            self.filterType = "template";
            self.searchPlaceHolder = "Search Templates...";


            self.filteredItems = self.templateList;
        };

        var timer = 0;
        var delay = 200;
        var prevent = false;

        this.clickedItem = function(e) {
            console.log("single clicked "+e.name);
            timer = setTimeout(function() {
                if (!prevent) {
                    $scope.$apply(function(){
                        console.log("not prevent");
                        self.clickElem(e);
                    });
                }
                console.log("Setting prevent false");
                prevent = false;
            }, delay);
        };

        this.dblClickedItem = function (e){
            console.log("double clicked "+e.name);
            clearTimeout(timer);
            prevent = true;
            console.log("setting prevent true");
            self.onSelectElem(e);
        };

    }]
});
