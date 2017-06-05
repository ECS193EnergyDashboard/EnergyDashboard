angular.module('dataTableModule').component('datatable', {
    templateUrl: 'data-table/data-table.template.html',
    bindings: {
        tableSrc:       '<',
        searchEnabled:  '<',
        reorderEnabled: '<',
        elemName:       '<',   // passed to columnTemplate component to determine template type
        selection:      '=',
        api:            '='
    },
    controller: ['$filter', '$scope', '$timeout', function TableController($filter, $scope, $timeout) {
        var self = this;
        this.data = [];
        this.sums = {};
        this.averages = {};
        this.columnNames = [];
        this.columnNamesObjs = [];
        this.maxAndMin = {};
        this.currentFormattingSettingsCol = {};
        this.showFormattingSettingsButtons = true;
        this.columnWidths = {};
        this.columNumWidths = [];

        this.errorMessage = "";

        this.$onInit = function(){
            this.api = {};
            this.api.update = onDataTableUpdate;
        };

        function onDataTableUpdate(){
            self.onColObjUpdate(null, null);
        };

        // Conditional Formatting Points
        this.colsPoints = {};
        function rgb(r, g, b) {
            return { r: r, g: g, b: b };
        }

        this.white = rgb(255, 255, 255);
        this.blue = rgb(0, 0, 255);
        this.red = rgb(255, 0, 0);
        this.green = rgb(0,100,0);
        this.purple = rgb(160,32,240);


        var selectionIndexOf = function(obj) {
            for (var i = 0; i < self.selection.length; i++) {
                if (self.selection[i].webId === obj.webId) {
                    return i;
                }
            }
            return -1;
        };

        var isSelected = function(obj) {
            return selectionIndexOf(obj) !== -1;
        };

        var deselect = function(obj) {
            var idx = selectionIndexOf(obj);
            if (idx !== -1) {
                self.selection.splice(idx, 1);
            }
        };

        var select = function(obj) {
            if (!isSelected(obj)) {
                self.selection.push(obj);
            }
        };

        this.formatValue = function(value) {
            if (value === undefined || value.value === undefined) {
                return "N/A";
            } else if (typeof(value.value) === "number") {
                return $filter('number')(value.value, 2);
            } else {
                return value.value;
            }
        };

        this.valueStyle = function(value) {
            var style = 'dataCell ';
            if (value === undefined) {
                style += 'missing';
            } else if (!value.good) {
                style += 'bad ';
            }
            if (value && isSelected(value)) {
                style += 'selected ';
            }
            return style;
        };



        this.getters = {
            value: function(key, element) {
                if(element[key] == undefined){
                    return;
                }
                return element[key].value;
            }
        };

        this.$onChanges = function() {

            if (this.searchEnabled === undefined) {
                this.searchEnabled = true;
            }
            if (this.reorderEnabled === undefined) {
                this.reorderEnabled = true;
            }
            if (this.selection === undefined) {
                this.selection = [];
            }
            if (this.tableSrc.length == 0) {
                return;
            }

            //console.log(this.tableSrc);
//            console.log("Datatable elemName", this.elemName);

            var columnSet = {};

            for (var element of this.tableSrc) {
                for (var key in element) {
                    if (key !== "name" && key !== "building") {
                        columnSet[key] = true;
                    }
                }
            }

            this.columnNamesObjs = [];

            this.columnNames = Object.keys(columnSet);

            var firstValues = 0;
            for (var columnName of this.columnNames) {
                var column = {};

                column.name = columnName;
                //All columns start showing conditional formating
                column.showConditionalFormat = true;
                column.max;
                column.min;
                column.maxColor = "Red";
                column.minColor = "Blue";

                try{
                    column.units = self.tableSrc[0][column.name].unitsAbbreviation;
                }
                catch(e){
                    column.units = "";
                }
                // Set the first 10 values as default
                if (firstValues < 10) {
                    column.isChecked = true;
                } else {
                    column.isChecked = false;
                }
                this.columnNamesObjs.push(column);
                firstValues++;
            }

            for (var element of this.tableSrc) {
                for (var name in element) {
                    Object.assign(element[name], { parentName: element.name, buildingName: element.building });
                }
            }
            // console.log(this.columnNamesObjs);

            this.displayed = this.data = this.tableSrc;
        }; //end $onChanges

        this.ShowColumnList = function(columnsNames) {
            // just a check to make sure the button can not be clicked when there is nothing to show
            if (columnsNames.length != 0) {
                document.getElementById("myDropdown").classList.toggle("show");
            }
        };



        this.updateCalculations = function() {
            this.sums = {};
            this.averages = {};
            this.maxAndMin = {};
            for (var column of this.columnNamesObjs) {
                this.sums[column.name] = this.sumColumn(column.name);
                this.averages[column.name] = this.averageColumn(column.name);
                this.maxAndMin[column.name] = this.maxMinColumn(column.name);
            }
        };

        this.sumColumn = function(columnName) {
            var acc = this.reduceColumn(columnName, { sum: 0 }, function(val, acc) { acc.sum += val; });
            return acc.sum;
        };

        this.averageColumn = function(columnName) {
            var acc = this.reduceColumn(columnName, { sum: 0, len: 0 }, function(val, acc) {
                acc.sum += val;
                acc.len++;
            });
            return acc.len > 0 ? acc.sum / acc.len : 0;
        };

        this.maxMinColumn = function(columnName){
            var acc = this.reduceColumn(columnName, {max: null, min: null}, function(val, acc){
                if(acc.max == null){
                    acc.max = val;
                }
                else if(val > acc.max){
                    acc.max = val;
                }

                if(acc.min == null){
                    acc.min = val;
                }
                else if(val < acc.min){
                    acc.min = val;
                }
            });
            return acc;
        }

        // For every currently displayed row in column 'columnName', applies the function 'opFunc' to the cell's value and the accumulator object 'accumulator'.
        // Returns the accumulated value object.
        this.reduceColumn = function(columnName, accumulator, opFunc) {
            var a = accumulator;
            for (var element of this.displayed) {
                var colVal = element[columnName];
                if (colVal && colVal.good && colVal.value != undefined) {
                    opFunc(colVal.value, a);
                }
            }
            return a;
        };

        this.updateCol = function(cols){
            this.columnNamesObjs = cols;
        };

        this.toggleCellSelected = function(value) {
            if (isSelected(value)) {
                deselect(value);
            } else {
                select(value);
            }
        };

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

        // this.submitFormattingSettings = function(col){
        //     // this.maxAndMin[colName.name].max = document.getElementById("maxInput").value;
        //     // this.maxAndMin[colName.name].min = document.getElementById("minInput").value;
        //     col.max = document.getElementById("maxInput").value;
        //     col.min = document.getElementById("minInput").value;
        //     col.maxColor = document.getElementById("maxColor").value;
        //     col.minColor = document.getElementById("minColor").value;
        //     document.getElementById("conditionalFormatForm").reset();
        // };



        this.submitFormattingSettings = function(col){
            var submittedMax = document.getElementById("maxInput").value;
            var submittedMin = document.getElementById("minInput").value;
 
            if(submittedMax.length != 0)
                col.max = submittedMax;
            else{
                col.max = null
            }
            if(submittedMin.length != 0)
                col.min = submittedMin;
            else{
                col.min = null
            }
            col.maxColor = document.getElementById("maxColor").value;
            col.minColor = document.getElementById("minColor").value;
 
            this.resetConditionalFormatForm();
        };


        this.resetConditionalFormatForm = function(){
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
            if(angular.isUndefined(col.max) || col.max == null){
                max = this.maxAndMin[value.name].max;
            }
            else{
                max = Number(col.max)
            }
            if(angular.isUndefined(col.min) || col.min == null){
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

        // Whenever the displayed data is changed, recalculate sum and average of the shown rows only
        $scope.$watch('$ctrl.displayed', function(newValue, oldValue) {
            // if nothing in data remove elms in columnNamesObjs to hide buttons/columns
            console.log(newValue);
            if(!(angular.isUndefined(newValue)) && newValue.length == 0){
                self.columnNamesObjs.length = 0;
            }
            self.updateCalculations();
        });

        var timeoutPromise;
        var delayInMs = 1000;
        var newWatch  = true;


        this.onColObjUpdate = function(newValue, oldValue){
            console.log("watch fired");
            $timeout.cancel(timeoutPromise);  //does nothing, if timeout already done
            timeoutPromise = $timeout(function() {   //Set timeout
                console.log("timeout fired");

                var tableRef = document.getElementById('dataTable');
                if(tableRef == null){
                    return;
                }
                //console.log("table has this many rows");
                //console.log(tableRef.rows.length);

                //console.log(self.columnNamesObjs);
                //For rows 1, 2 and 3
                for (var row = 1; (row < 4) && (row < tableRef.rows.length); row++) {
                    var colObj;
                    var tableRow = tableRef.rows[row]; //Get reference to row of table
                    var c = 0;

                    //For every cell
                    for (var col = 0; col < tableRow.cells.length; col++) {
                        var tableCell = tableRow.cells[col]; //get cell at position col
                        var print = '#' + row + ',' + col + ': ' + tableCell.offsetWidth + " px";
                        console.log(print);

                        if (row === 3) {
                            if (true) {
                                tableRef.rows[0].cells[col].style.maxWidth = tableCell.offsetWidth + 'px';
                                tableRef.rows[0].cells[col].style.minWidth = tableCell.offsetWidth + 'px';
                            }
                            else { /* For debugging purposes */
                                colObj = self.columnNamesObjs[c];
                                console.log("Entering col: " + colObj.name +" isChecked: "+colObj.isChecked);

                                if(typeof colObj == 'undefined'){
                                    console.log('undefined col in timeout')
                                    continue;
                                }
                                for (;c  <=  tableRow.cells.length && !colObj.isChecked; c++) {
                                    console.log("skipping over: " + colObj.name+" isChecked: "+colObj.isChecked);
                                    colObj = self.columnNamesObjs[c];
                                }

                                c++;
                                console.log("Found: " + colObj.name)
                                $scope.$apply(function (){
                                    //self.columnWidths[col]  = tableCell.offsetWidth + 'px';
                                    self.columNumWidths[col] = tableCell.offsetWidth + 'px';
                                });
                                console.log("changing width to: " + tableCell.offsetWidth);
                            }
                        }
                    }
                }
                var headerHeight = document.getElementById('dataTableHead').offsetHeight;
                console.log('Timeout: header height: '+headerHeight);
                tableRef.style.top = headerHeight + "px";

                $scope.$apply(function (){
                    tableRef.style.top = headerHeight + "px";
                });
                console.log('Timeout: data table top: '+tableRef.style.top)
            }, delayInMs);

            var tableRef = document.getElementById('dataTable');
            var fixedHeader = document.getElementById('dataTableHead');
            if(fixedHeader != null) {
                var headerHeight = document.getElementById('dataTableHead').offsetHeight;
                //console.log('header height: '+headerHeight);
                tableRef.style.top = headerHeight + "px";

                //console.log('data table top: '+tableRef.style.top)
            }
        };

        $scope.$watch('$ctrl.columnNamesObjs', self.onColObjUpdate, true);

        this.colUpdate = function(column){
            //console.log(column.name + " changed");
        }



    }]
});



    // Checks to make sure that input only takes in numbers (used for conditonal formatting)
    function isNumberKey(evt){
        var charCode = (evt.which) ? evt.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }    