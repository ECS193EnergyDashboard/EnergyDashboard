angular.module('sideNavModule').component('sideBar', {
    templateUrl: 'side-nav/side.template.html',
    bindings: {
        onClick: '&'
    },
    controller: [ 'pi', function TableController(pi) {
        var self = this;

        // webid for buildings list
        var webId = 'E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT';
        pi.getValuesOfChildren(webId).then(function(data) {
            self.buildings = data.elements;
            console.log("buildings: ", self.buildings);
        });

        this.clickElem = function(element) {
            if (element.elements == null || element.elements === undefined) {
                pi.getValuesOfChildren(element.webId).then(function(data) {
                    element.elements = data.elements;
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
        }

        this.onSelectElem = function(element) {
            self.onClick({ name: element.name, webId: element.webId })
        }

    }]
});
