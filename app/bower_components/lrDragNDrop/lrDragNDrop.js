(function (ng) {
    'use strict';

    // function isJqueryEventDataTransfer(){
    //     return window.jQuery && (-1 == window.jQuery.event.props.indexOf('dataTransfer'));
    // }

    // if (isJqueryEventDataTransfer()) {
    //     window.jQuery.event.props.push('dataTransfer');
    // }

    //Declare lrDragNDrop module
    var module = ng.module('lrDragNDrop', []);


    module.service('lrDragStore', ['$document', function (document) {
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
        * Checks if item is stored at namespace key
        * @param namespace
        * @returns {boolean}
        */
        this.isHolding = function (namespace) {
            return store[namespace] !== undefined;
        };

        // Binds end-of-drag event to clean stored array
        document.bind('dragend', this.clean);
    }]);

    module.service('lrDragHelper', function () {
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
            //Returns collection object specified in ng-repeat
            return scope.$eval(match[2]);
        };

        /**
         * Template for directives link function
         * @param store the lrDragStore service
         * @param safe  Boolen for safe mode dragNDrop
         * @returns {compileFunc} Link function for directives
         */
        th.lrDragSrcDirective = function(store, safe) {
            return function compileFunc(el, iattr) {
                //Sets 'draggable' attribute on element
                iattr.$set('draggable', true);
                return function linkFunc(scope, element, attr) {
                    var
                        collection,
                        key = (safe === true ? attr.lrDragSrcSafe : attr.lrDragSrc ) || 'temp';

                    if(attr.lrDragData) {
                        scope.$watch(attr.lrDragData, function (newValue) {
                            collection = newValue;
                        });
                    } else {
                        //Fills collection with collection object from ng-repeat
                        collection = th.parseRepeater(scope, attr);
                    }

                    //Binds start-of-drag event of element to this function
                    element.bind('dragstart', function (evt) {
                        //Stores dragged item in lrDragStore service's array
                        store.hold(key, collection[scope.$index], collection, safe);
                        if(angular.isDefined(evt.dataTransfer)) {
                            evt.dataTransfer.setData('text/html', null); //FF/jQuery fix
                        }
                    });
                }
            }
        }
    });

    module.directive('lrDragSrc', ['lrDragStore', 'lrDragHelper', function (store, dragHelper) {
        return{
            //Used to generate link function with only variation being safe mode boolean off
            compile: dragHelper.lrDragSrcDirective(store)
        };
    }]);

    module.directive('lrDragSrcSafe', ['lrDragStore', 'lrDragHelper', function (store, dragHelper) {
        return{
            //Used to generate link function with only variation being safe mode boolean on
            compile: dragHelper.lrDragSrcDirective(store, true)
        };
    }]);

    module.directive('lrDropTarget', ['lrDragStore', 'lrDragHelper', '$parse', function (store, dragHelper, $parse) {
        return {
            link: function (scope, element, attr) {
                //Default namespace/key is 'temp'
                var
                    collection,
                    key = attr.lrDropTarget || 'temp',
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


                if(attr.lrDragData) {
                    scope.$watch(attr.lrDragData, function (newValue) {
                        collection = newValue;
                    });
                } else {
                    //Fills collection with collection object from ng-repeat
                    collection = dragHelper.parseRepeater(scope, attr);
                }

                //Binds drop event to this element
                element.bind('drop', function (evt) {
                    var
                        collectionCopy = ng.copy(collection),
                        item = store.get(key),
                        dropIndex, i, l;
                    if (item !== null) {
                        dropIndex = scope.$index;
                        dropIndex = isAfter(evt.offsetX, evt.offsetY) ? dropIndex + 1 : dropIndex;
                        //srcCollection=targetCollection => we may need to apply a correction
                        if (collectionCopy.length > collection.length) {
                            for (i = 0, l = Math.min(dropIndex, collection.length - 1); i <= l; i++) {
                                if (!ng.equals(collectionCopy[i], collection[i])) {
                                    dropIndex = dropIndex - 1;
                                    break;
                                }
                            }
                        }
                        scope.$apply(function () {
                            collection.splice(dropIndex, 0, item);
                            var fn = $parse(attr.lrDropSuccess) || ng.noop;
                            fn(scope, {e: evt, item: item, collection: collection});
                        });
                        evt.preventDefault();
                        resetStyle();
                        store.clean();
                    }
                });

                element.bind('dragleave', resetStyle);

                element.bind('dragover', function (evt) {
                    var className;
                    if (store.isHolding(key)) {
                        className = isAfter(evt.offsetX, evt.offsetY) ? 'lr-drop-target-after' : 'lr-drop-target-before';
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