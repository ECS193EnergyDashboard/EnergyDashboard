angular.module('sideNavSelectorModule').component('sideBarSelector', {
    templateUrl: 'side-nav-selector/side-selector.template.html',
    bindings: {
        selected: '=',
        onClick: '&'
    },
    controller: [ 'pi', function TableController(pi) {
        var self = this;
        // Highlighted Item Index
        self.hlIndex = -1;

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';
        pi.getChildrenOfElement(webId).then(function(data) {
            self.buildings = data;
            //console.log("buildings: ", self.buildings);
        });

        this.printSelected = function() {
            console.log("SideSelector: Items in selected list");
            console.log(this.selected);
            console.log("\n")
        };

        /**
         * Removes element from the selected array
         * @param e Element to be removed
         */
        this.removeElem = function (e)   {
            this.selected.splice(this.selected.indexOf(e), 1);
        };

        this.clearSelected = function() {
            this.selected.length = 0;
            this.selected.push({building: "DummyBuilding",
                hasChildren: false,
                name:"DUMMY_ITEM",
                numId:"-1",
                template:"DUMMY_TEMPLATE",
                webId:"E0bgZy4oKQ9kiBiZJTW7eugwvCuLHcGs5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdTXEFUSVJD"
            });
        };

        this.isDummyItem = function(e) {
            return -1 == e.numId;
        };

        this.clickElem = function(element) {
            if (element.elements === undefined || element.elements == null ) {
                pi.getChildrenOfElement(element.webId).then(function(data) {
                    element.elements = data;
                    console.log("clicked: " + element.name);
                    //console.log(element.name +" data", data.elements);
                });
            }

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
            console.log("Loading(in side.comp.js): "+self.$loading);
        };

        // Functions to evaluate conditions for showing/hiding certain icons/classes
        this.isSelectedElem= function(e) {
            return (e.numId == self.hlIndex);
        };

        this.isLoading = function(e) {
            return ((e.numId == self.hlIndex) && self.loading);
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

    }]
});
