angular.module('core.conditionalFormatting').
    factory('conditionalFormatting', [
        function() {
            var cf = {};

            // Easily make rgb obj
            cf.colsPoints = {};
            function rgb(r, g, b) {
                return { r: r, g: g, b: b };
            }

            // Predefined colors
            cf.white = rgb(255, 255, 255);
            // cf.blue = rgb(0, 0, 255);
            cf.blue = rgb(106, 166, 186);
            // cf.red = rgb(255, 0, 0);
            cf.red = rgb(244,99,106);

            // cf.green = rgb(0,100,0);
            cf.green = rgb(162, 243, 216);
            // cf.purple = rgb(160,32,240);
            cf.purple = rgb(136, 142, 164);
            cf.yellow = rgb(248, 194, 0);
            cf.init = function(column){
                //All columns start showing conditional formating
                column.showConditionalFormat = true;
            }

            // =====--- CONDITIONAL FORMATTING ---===== //

            cf.isUndefined = function(thing) {
                return angular.isUndefined(thing);
            }



            cf.showFormattingSettings = function(col, modalClass){
                $("."+ modalClass).modal();
            };

            /**
             * Returns style for conditional formatting
             * @param value - numeric value used to determine color
             * @param col - column that the value is part of
             * @param maxAndMin - max and min array containing col
             * @return css style
             */
            cf.conditionalFormat = function(value, col, maxAndMin, isAnalysis){
                //console.log("isAnalysis: ", isAnalysis);
                // Do nothing on bad/undef values
                if(value == undefined || !value.good || maxAndMin[value.name] == undefined){
                    return {};
                }

                // Remove conditional formatting for data tab
                if(col.showConditionalFormat == false){
                    return {"background-color": "white"}
                }
                // Remove conditional formatting for analysis tab
                // NOTE col[value.name] gets the inner col in analysis
                if(!angular.isUndefined(col[value.name]) && col[value.name].showConditionalFormat == false){
                    return {"background-color": "white"}
                }
                // Check is there is a user submitted max and min else use the max/ min of current data.
                var max, min;
                if(!angular.isUndefined(col.max) && col.max != null){
                    max = Number(col.max)
                }
                else if(!angular.isUndefined(col[value.name]) && !angular.isUndefined(col[value.name].max)){
                    if(col[value.name].max == null){
                        max = maxAndMin[value.name].max;
                    }
                    else{
                        max = Number(col[value.name].max);
                    }
                }
                else{
                    max = maxAndMin[value.name].max;
                }

                if(!angular.isUndefined(col.min) && col.min != null){
                    min = Number(col.min)
                }
                else if(!angular.isUndefined(col[value.name]) && !angular.isUndefined(col[value.name].min)){
                    if(col[value.name].min == null){
                        min = maxAndMin[value.name].min;
                    }
                    else{
                        min = Number(col[value.name].min);
                    }
                    min = Number(col[value.name].min);
                }
                else{
                    min = maxAndMin[value.name].min;
                }
                if(max == min){
                    return {};
                }

                // Check if user submitted color, if not default to red and blue for max and min respectivly.
                var maxColor = cf.red, minColor = cf.blue;
                if(col.maxColor == "Red" || (col[value.name] != undefined && col[value.name].maxColor == "Red")){
                    maxColor = cf.red;
                }
                else if(col.maxColor == "Blue" || (col[value.name] != undefined && col[value.name].maxColor == "Blue")){
                    maxColor = cf.blue;
                }
                else if(col.maxColor == "Green" || (col[value.name] != undefined && col[value.name].maxColor == "Green")){
                    maxColor = cf.green;
                }
                else if(col.maxColor == "Purple" || (col[value.name] != undefined && col[value.name].maxColor == "Purple")){
                    maxColor = cf.purple;
                }

                if(col.minColor == "Red" || (col[value.name] != undefined && col[value.name].minColor == "Red")){
                    minColor = cf.red;
                }
                else if(col.minColor == "Blue" || (col[value.name] != undefined && col[value.name].minColor == "Blue")){
                    minColor = cf.blue;
                }
                else if(col.minColor == "Green" || (col[value.name] != undefined && col[value.name].minColor == "Green")){
                    minColor = cf.green;
                }
                else if(col.minColor == "Purple" || (col[value.name] != undefined && col[value.name].minColor == "Purple")){
                    minColor = cf.purple;
                }


                var color;
                if(isAnalysis == 'true')
                {
                    cf.colsPoints[col.name][value.name] =  [
                        { value: min, color: minColor},
                        { value: (max+min)/2, color: cf.white },
                        { value: max, color: maxColor},
                    ];

                    color = gradient(cf.colsPoints[col.name][value.name])(value.value);
                }
                // Is data table
                else{
                    cf.colsPoints[value.name] = [
                        { value: min, color: minColor},
                        { value: (max+min)/2, color: cf.white },
                        { value: max, color: maxColor},
                    ];

                    color = gradient(cf.colsPoints[col.name])(value.value);
                }

                var textColor = "white";
                // Calculate overall intensity of color to determine text color
                var intensity = color.r * 0.299 + color.g * 0.597 + color.b * 0.114;
                if (intensity > 186) {
                    textColor = "black";
                }

                return { "background-color": "rgb(" +color.r+ "," +color.g+ "," +color.b+ ")",
                        "color": textColor };
            }

            return cf;

        }
    ]);
