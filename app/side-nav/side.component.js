angular.module('sideNavModule').component('sideBar', {
    templateUrl: 'side-nav/side.template.html',
    bindings: {
        isLoading: '<',
        onClick: '&'
    },
    controller: [ 'pi', function TableController(pi) {
        var self = this;
        // Highlighted Item Index
        self.hlIndex = -1;
        self.searchPlaceHolder = "Building name...";
        self.filter= "name";
        self.search = {name:'', template:''};

        // Controller constructor called after bindings initialized
        self.$onInit = function() {

        };

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';
        pi.getChildrenOfElement(webId).then(function(data) {
            self.buildings = data;
            //console.log("buildings: ", self.buildings);
        });

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
        this.searchBuildings = function(){
            self.filter = "name";
            self.searchPlaceHolder = "Search Buildings...";
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

        };

        this.showToolTip = function(icon){
            if(icon == "searchBuildings"){
                console.log("EFEF");
                // document.getElementById("searchBuildingsToolTip").show();
            }
        };

    }]
});


$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});
