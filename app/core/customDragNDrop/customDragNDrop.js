(function (ng) {
    'use strict';

    // function isJqueryEventDataTransfer(){
    //     return window.jQuery && (-1 == window.jQuery.event.props.indexOf('dataTransfer'));
    // }

    // if (isJqueryEventDataTransfer()) {
    //     window.jQuery.event.props.push('dataTransfer');
    // }

    //Declare customDragNDrop module
    var module = ng.module('customDragNDrop', []);
    //Stores a dragged item
    module.service('customDragStore', ['$document', function (document) {
        //Array of stored items
        var store = {};

        /**
         * Stores an item-collection pair by [key] in the store list
         * @param {string} key              map key of value
         * @param {object} item             specific object to store
         * @param {object} collectionFrom   list from which item originated
         * @param {object} safe             true if removing item from collection,
         *                                  false otherwise
         */
        this.hold = function hold(key, item, collectionFrom, safe) {
            store[key] = {
                item: item,
                collection: collectionFrom,
                safe: safe === true
            }
        };

       /**
        * Gets the item stored at key namespace and returns it, null if not found
        * @param {string} namespace
        * @returns {object} item
        */
        this.get = function (namespace) {
            var
                modelItem = store[namespace], itemIndex;

            if (modelItem) {
                itemIndex = modelItem.collection.indexOf(modelItem.item);
                return modelItem.safe === true ? modelItem.item : modelItem.collection.splice(itemIndex, 1)[0];
            } else {
                return null;
            }
        };

       /**
        * Clears items stored
        */
        this.clean = function clean() {
            store = {};
        };

       /**
        * Checks if items are stored at namespace key
        * @param namespace
        * @returns {boolean}
        */
        this.isHolding = function (namespace) {
            return store[namespace] !== undefined;
        };

        // Binds end-of-drag event to clean stored array
        document.bind('dragend', this.clean);
    }]);

    module.service('customDragHelper', function () {
        var th = this;

        /**
         * Parses the ng-repeat attribute and returns the collection, e.g. y in 'x in y'
         * @param scope Angular $scope
         * @param attr  Angular $attribute
         * @returns {list}
         */
        th.parseRepeater = function(scope, attr) {
            var
                repeatExpression = attr.ngRepeat,
                match;

            if (!repeatExpression) {
                throw Error('this directive must be used with ngRepeat directive');
            }
            //Parses ng-repeat attribute
            match = repeatExpression.match(/^(.*\sin).(\S*)/);
            if (!match) {
                throw Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
                    repeatExpression + "'.");
            }
            //console.log("customDragHelper: "+JSON.stringify(JSON.stringify(attr.class))+" "+JSON.stringify(match)+" "+JSON.stringify(match[2]));
            ////console.log(scope.$parent.$eval(match[2]+"\n"));
            //Returns collection object specified in ng-repeat
            return scope.$parent.$eval(match[2]);
        };

        /**
         * Template for directives link function
         * @param store the customDragStore service
         * @param safe  Boolen for safe mode dragNDrop
         * @returns {compileFunc} Link function for directives
         */
        th.customDragSrcDirective = function(store, safe) {
            return function compileFunc(el, iattr) {
                //Sets 'draggable' attribute on element
                iattr.$set('draggable', true);
                return function linkFunc(scope, element, attr) {
                    var
                        collection,
                        key = (safe === true ? attr.customDragSrcSafe : attr.customDragSrc ) || 'temp';

                    //console.log("customDragSrcDir: Length:{"+scope.dummy+"} index: {"+scope.index+"}");
                    if(attr.customDragData) {
                        scope.$watch(attr.customDragData, function (newValue) {
                            collection = newValue;
                        });
                    } else {
                        //Fills collection with collection object from ng-repeat
                        //console.log("customDragSrcDir: DragSrcCalling parser");
                        collection = th.parseRepeater(scope, attr);
                        ////console.log(collection);
                    }
                    //Updates collection list when list changes on side-bar
                    scope.$watch('dummy', function(oldVal, newVal){
                        //console.log("customDragSrcDir: changed \'"+key+"\' Length: {"+scope.dummy+"} index: {"+scope.index+"}");


                        //collection = th.parseRepeater(scope, attr);
                        ////console.log(collection);
                        ////console.log(safe);
                    });

                    //Binds start-of-drag event of element to this function
                    element.bind('dragstart', function (evt) {
                        //console.log("customDragSrcDir: Dragstart w/ key: {"+key+"} Length: {"+scope.dummy+"} index: {"+scope.index+"}");
                        //Reparses collection
                        collection = th.parseRepeater(scope, attr);
                        //console.log("customDragSrcDir: Dragged item is");
                        //console.log(collection[scope.index]);
                        //console.log("\n")

                        ////console.log(safe);
                        //Stops drag event from dragging parent elems
                        evt.stopPropagation();
                        //Stores dragged item in customDragStore service's array
                        store.hold(key, collection[scope.index], collection, safe);
                        if(angular.isDefined(evt.dataTransfer)) {
                            evt.dataTransfer.setData('text/html', null); //FF/jQuery fix
                        }
                    });
                }
            }
        }
    });

    module.directive('customDragSrc', ['customDragStore', 'customDragHelper', function (store, dragHelper) {
        return{
            scope: {
                dummy: '<',
                index: '<'
            },
            //Used to generate link function with only variation being safe mode boolean off
            compile: dragHelper.customDragSrcDirective(store)
        };
    }]);

    module.directive('customDragSrcSafe', ['customDragStore', 'customDragHelper', function (store, dragHelper) {
        return{
            scope: {
                dummy: '<',
                index: '<'
            },
            //Used to generate link function with only variation being safe mode boolean on
            compile: dragHelper.customDragSrcDirective(store, true)
        };
    }]);

    module.directive('customDropTarget', ['customDragStore', 'customDragHelper', '$parse', function (store, dragHelper, $parse) {
        return {
            link: function (scope, element, attr) {
                var
                    collection,                                 //Stores items in dropped list
                    key = attr.customDropTarget || 'temp',          //Default namespace/key is 'temp'
                    classCache = null;

                /**
                 * Checks position of dragged item
                 * @param x x position
                 * @param y y position
                 * @returns {boolean}
                 */
                function isAfter(x, y) {
                    //check if below or over the diagonal of the box element
                    return (element[0].offsetHeight - x * element[0].offsetHeight / element[0].offsetWidth) < y;
                }

                /**
                 * Clears classCache class
                 */
                function resetStyle() {
                    if (classCache !== null) {
                        element.removeClass(classCache);
                        classCache = null;
                    }
                }

                if(attr.customDragData) {
                    scope.$watch(attr.customDragData, function (newValue) {
                        collection = newValue;
                    });
                } else {
                    //console.log("customDropTarger calling parser");
                    //Fills collection with collection object from ng-repeat
                    collection = dragHelper.parseRepeater(scope, attr);
                }

                //Binds drop event to np-repeat element
                element.bind('drop', function (evt) {
                    var
                        collectionCopy = ng.copy(collection),           //Copy of items in dragged list
                        item = store.get(key),                          //Retrieves dragged item
                        dup = false,
                        dropIndex, i, l;
                    //console.log("customDropTarget: Drop: Item:");
                    //console.log(item);
                    //console.log("\n");
                    //Check is item is duplicate
                    if(-1 < collection.indexOf(item) ){
                        //Item is duplicate
                        dup = true;
                        //console.log("customDropTarget: Is duplicate")
                    }


                    if (item !== null) {
                        //Sets index to index of item that cursor is dropping on
                        dropIndex = scope.$index;
                        //Sets index to be after or before the item cursor is dropping on
                        dropIndex = isAfter(evt.offsetX, evt.offsetY) ? dropIndex + 1 : dropIndex;
                        //srcCollection=targetCollection => we may need to apply a correction
                        //Checks if item was removed from source collection
                        if (collectionCopy.length > collection.length) {
                            for (i = 0, l = Math.min(dropIndex, collection.length - 1); i <= l; i++) {
                                //Looks for uncommon item indices
                                if (!ng.equals(collectionCopy[i], collection[i])) {
                                    dropIndex = dropIndex - 1;
                                    break;
                                }
                            }
                        }
                        if(!dup) {
                            scope.$apply(function () {
                                //Adds item to collection at index dropIndex
                                collection.splice(dropIndex, 0, item);
                                var fn = $parse(attr.customDropSuccess) || ng.noop;
                                fn(scope, {e: evt, item: item, collection: collection});
                            });
                            evt.preventDefault();
                            resetStyle();
                            store.clean();
                        }
                        else{
                            //console.log("customDropTarget: Alert: Is duplicate");
                            evt.preventDefault();
                            resetStyle();
                            store.clean();
                        }
                    }
                });

                //Makes the drag leave event reset the css style
                element.bind('dragleave', resetStyle);
                //Makes drag over event change css
                element.bind('dragover', function (evt) {
                    var className;
                    if (store.isHolding(key)) {
                        className = isAfter(evt.offsetX, evt.offsetY) ? 'custom-drop-target-after' : 'custom-drop-target-before';
                        if (classCache !== className && classCache !== null) {
                            element.removeClass(classCache);
                        }
                        if (classCache !== className) {
                            element.addClass(className);
                        }
                        classCache = className;
                    }
                    evt.preventDefault();
                });
            }
        };
    }]);
})(angular);