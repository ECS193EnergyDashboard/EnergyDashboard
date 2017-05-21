angular.module('core.cf').
    factory('cf', [
        function() {
            var cf = {};

            // Easily make rgb obj
            cf.colsPoints = {};
            function rgb(r, g, b) {
                return { r: r, g: g, b: b };
            }

            // Predefined colors
            cf.white = rgb(255, 255, 255);
            cf.blue = rgb(0, 0, 255);
            cf.red = rgb(255, 0, 0);
            cf.green = rgb(0,100,0);
            cf.purple = rgb(160,32,240);

            cf.init = function(column){
                //All columns start showing conditional formating
                column.showConditionalFormat = true;
            }

            // =====--- CONDITIONAL FORMATTING ---===== //

            cf.isUndefined = function(thing) {
                return angular.isUndefined(thing);
            }

            cf.toggleConditionalFormatting = function(col){
                col.showConditionalFormat = !col.showConditionalFormat;
            };

            cf.showFormattingSettings = function(col, modalClass){
                $("."+ modalClass).modal();
            };

            /*cf.showHideSettingsButtons = function(){
                cf.showFormattingSettingsButtons = !cf.showFormattingSettingsButtons;
                //console.log(cf.showFormattingSettingsButtons);
            };*/

            cf.submitFormattingSettings = function(col){
                // maxAndMin[colName.name].max = document.getElementById("maxInput").value;
                // maxAndMin[colName.name].min = document.getElementById("minInput").value;
                col.max = document.getElementById("maxInput").value;
                col.min = document.getElementById("minInput").value;
                col.maxColor = document.getElementById("maxColor").value;
                col.minColor = document.getElementById("minColor").value;
                document.getElementById("conditionalFormatForm").reset();
            };


            cf.conditionalFormat = function(value, col, maxAndMin){
                // Do nothing on bad/undef values
                if(value == undefined || !value.good || maxAndMin[value.name] == undefined){
                    return {};
                }

                // Remove conditional formatting
                if(col.showConditionalFormat == false){
                    return {"background-color": "white"}
                }
                // Check is there is a user submitted max and min else use the max/ min of current data.
                var max, min;
                if(angular.isUndefined(col.max)){
                    max = maxAndMin[value.name].max;
                }
                else{
                    max = Number(col.max)
                }
                if(angular.isUndefined(col.min)){
                    min = maxAndMin[value.name].min;
                }
                else{
                    min = Number(col.min)
                }
                if(max == min){
                    return {};
                }

                // Check if user submitted color, if not default to red and blue for max and min respectivly.
                var maxColor, minColor;
                if(col.maxColor == "Red"){
                    maxColor = cf.red;
                }
                else if(col.maxColor == "Blue"){
                    maxColor = cf.blue;
                }
                else if(col.maxColor == "Green"){
                    maxColor = cf.green;
                }
                else if(col.maxColor == "Purple"){
                    maxColor = cf.purple;
                }

                if(col.minColor == "Red"){
                    minColor = cf.red;
                }
                else if(col.minColor == "Blue"){
                    minColor = cf.blue;
                }
                else if(col.minColor == "Green"){
                    minColor = cf.green;
                }
                else if(col.minColor == "Purple"){
                    minColor = cf.purple;
                }
                cf.colsPoints[value.name] = [
                    { value: min, color: minColor},
                    { value: (max+min)/2, color: cf.white },
                    { value: max, color: maxColor},
                ]

                var color = gradient(cf.colsPoints[value.name])(value.value);

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
