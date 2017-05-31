angular.module('core.treeFilter').filter('treeFilter', function() {
    return function (input, optional1, optional2) {
        var searchType = optional2;
        //console.log(searchType);
        //console.log(optional1);
        if(optional1[searchType] == null){
            //console.log(optional2);
            var searchString = optional1[searchType].toLowerCase();
        }
        else {
            var searchString = optional1[searchType].toLowerCase();
        }

        //Check if filter is disabled
        if(searchString.length == 0){
            //console.log("treeFilter: disabled input: ");
            //console.log(input);
            return input;
        }

        //console.log("Filter enabled looking for:"+optional1.name+" "+optional2+" in: ");
        //console.log(input);
        //Var to hold search results
        var out = [];
        //Clone input array into queue
        var list = input.slice(0);
        //Iterate while queue not empty
        while(0 < list.length){
            //Get top element
            var frontElem = list.shift();
            var elemAttr = frontElem[ searchType ].toLowerCase();
            //console.log("has "+optional2+" attr: "+elemAttr);

            //Check if search matches
            if(elemAttr.includes( searchString )){
                //console.log("Filter adding: "+frontElem.name);
                //Add element to output
                out.push(frontElem);
            }
            //Check if element has children
            if(frontElem.hasChildren && frontElem.elements){
                //Push all children onto queue
                frontElem.elements.forEach(function(e){
                    list.push(e);
                })
            }
        }
        return out;
    }
});