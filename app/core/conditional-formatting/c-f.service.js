angular.module('core.cf').
    factory('cf', [
        function() {


            // Easily make rgb obj
            this.colsPoints = {};
            function rgb(r, g, b) {
                return { r: r, g: g, b: b };
            }

            // Predefined colors
            this.white = rgb(255, 255, 255);
            this.blue = rgb(0, 0, 255);
            this.red = rgb(255, 0, 0);
            this.green = rgb(0,100,0);
            this.purple = rgb(160,32,240);

            this.init = function(column){
                //All columns start showing conditional formating
                column.showConditionalFormat = true;
            }

            // =====--- CONDITIONAL FORMATTING ---===== //

            this.isUndefined = function(thing) {
                return angular.isUndefined(thing);
            }

            this.switchShowConditionalFormat = function(col){
                col.showConditionalFormat = !col.showConditionalFormat;
            };

            this.showFormattingSettings = function(col){
                this.currentFormattingSettingsCol = col
                $(".formattingSettingsModal").modal();
            };

            this.showHideSettingsButtons = function(){
                this.showFormattingSettingsButtons = !this.showFormattingSettingsButtons;
                //console.log(this.showFormattingSettingsButtons);
            };

            this.submitFormattingSettings = function(col){
                // this.maxAndMin[colName.name].max = document.getElementById("maxInput").value;
                // this.maxAndMin[colName.name].min = document.getElementById("minInput").value;
                col.max = document.getElementById("maxInput").value;
                col.min = document.getElementById("minInput").value;
                col.maxColor = document.getElementById("maxColor").value;
                col.minColor = document.getElementById("minColor").value;
                document.getElementById("conditionalFormatForm").reset();
            };


            this.conditionalFormat = function(value, col){
                // Do nothing on bad/undef values
                if(value == undefined || !value.good || this.maxAndMin[value.name] == undefined){
                    return {};
                }

                // Remove conditional formatting
                if(col.showConditionalFormat == false){
                    return {"background-color": "white"}
                }
                // Check is there is a user submitted max and min else use the max/ min of current data.
                var max, min;
                if(angular.isUndefined(col.max)){
                    max = this.maxAndMin[value.name].max;
                }
                else{
                    max = Number(col.max)
                }
                if(angular.isUndefined(col.min)){
                    min = this.maxAndMin[value.name].min;
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
                    maxColor = this.red;
                }
                else if(col.maxColor == "Blue"){
                    maxColor = this.blue;
                }
                else if(col.maxColor == "Green"){
                    maxColor = this.green;
                }
                else if(col.maxColor == "Purple"){
                    maxColor = this.purple;
                }

                if(col.minColor == "Red"){
                    minColor = this.red;
                }
                else if(col.minColor == "Blue"){
                    minColor = this.blue;
                }
                else if(col.minColor == "Green"){
                    minColor = this.green;
                }
                else if(col.minColor == "Purple"){
                    minColor = this.purple;
                }
                this.colsPoints[value.name] = [
                    { value: min, color: minColor},
                    { value: (max+min)/2, color: this.white },
                    { value: max, color: maxColor},
                ]

                var color = gradient(this.colsPoints[value.name])(value.value);

                var textColor = "white";
                // Calculate overall intensity of color to determine text color
                var intensity = color.r * 0.299 + color.g * 0.597 + color.b * 0.114;
                if (intensity > 186) {
                    textColor = "black";
                }

                return { "background-color": "rgb(" +color.r+ "," +color.g+ "," +color.b+ ")",
                        "color": textColor };
            }

        }
    ]);
