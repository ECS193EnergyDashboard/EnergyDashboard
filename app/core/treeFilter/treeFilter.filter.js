angular.module('core.treeFilter').filter('treeFilter', function() {
    return function (input, optional1, optional2) {
        //Check if filter is disabled
        if(optional1.name.length == 0 || optional2 == 0){
            console.log("treeFilter: disabled input: ");
            console.log(input);
            return input;
        }

        console.log("Filter enabled looking for:"+optional1.name+": in: ");
        console.log(input);
        //Var to hold search results
        var out = [];
        //Clone input array into queue
        var list = input.slice(0);
        //Iterate while queue not empty
        while(0 < list.length){
            //Get top element
            var frontElem = list.shift();

            //Check if search matches
            if(frontElem.name.toLowerCase().includes(optional1.name.toLowerCase())){
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