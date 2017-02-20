angular.module('sideNavModule').component('sideBar', {
    templateUrl: 'side-nav/side.template.html',
    bindings: {
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

        this.clickElem = function(element) {
            if (element.elements == null || element.elements === undefined) {
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
        };

    }

    ]
});
