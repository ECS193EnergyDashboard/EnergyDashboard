angular.module('dataTableModule')
.component('datatable', {
    templateUrl: 'data-table/data-table.template.html',
    bindings: {
        tableSrc:       '<',
        searchEnabled:  '<',
        reorderEnabled: '<',
        elemName:       '<',   // passed to columnTemplate component to determine template type
        selection:      '=',
        api:            '='
    },
    controller: ['$filter', '$scope', '$timeout', 'conditionalFormatting', 'reduceColumn', function TableController($filter, $scope, $timeout, cf, rc) {
        var self = this;
        this.data = [];
        this.sums = {};
        this.averages = {};
        this.columnNames = [];
        this.columnNamesObjs = [];
        this.maxAndMin = {};
        this.currentFormattingSettingsCol = {};  //Current col for CF settings
        this.showFormattingSettingsButtons = true;
        this.columnWidths = {};
        this.columNumWidths = [];
        $scope.cf = cf; //Give html access to cf service
        this.rowName = "";
        this.rowsDisplayed = [];



        this.$onInit = function(){
            this.api = {};
            this.api.update = onDataTableUpdate;
        };

        function onDataTableUpdate(){
            self.onColObjUpdate(null, null);
        };

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

        // Called in html to open the CF settings modal
        this.openCogModal = function(col){
            this.currentFormattingSettingsCol = col;
            cf.showFormattingSettings(col, 'formattingSettingsModal');
        }

        // Called in html to toggle CF
        this.toggleConditionalFormatting = function(col){
            col.showConditionalFormat = !col.showConditionalFormat;
        };

        this.showHideSettingsButtons = function(){
          this.showFormattingSettingsButtons =   !this.showFormattingSettingsButtons;
        };

        // Called in html to apply the CF settings
        this.submitFormattingSettings = function(col){
            col.max = document.getElementById("maxInput").value;
            col.min = document.getElementById("minInput").value;
            col.maxColor = document.getElementById("maxColor").value;
            col.minColor = document.getElementById("minColor").value;
            document.getElementById("conditionalFormatForm").reset();
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
                cf.init(column);

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

            gTable = this.data;
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
                // var col = this.displayed.map(function(row) {
                var col = this.rowsDisplayed.map(function(row) {
                    return row[column.name];
                });
                this.sums[column.name] = rc.sum(col);
                this.averages[column.name] = rc.average(col);
                this.maxAndMin[column.name] = {
                    min: rc.min(col), max: rc.max(col)
                };
            }
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



        // Whenever the displayed data is changed, recalculate sum and average of the shown rows only
        $scope.$watch('$ctrl.displayed', function(newValue, oldValue) {
            // if nothing in data remove elms in columnNamesObjs to hide buttons/columns
            //console.log(newValue);
            if(!(angular.isUndefined(newValue)) && newValue.length == 0){
                self.columnNamesObjs.length = 0;
            }
            self.updateCalculations();
        });

        // Whenever the displayed data is changed, recalculate sum and average of the shown rows only
        $scope.$watchCollection('$ctrl.rowsDisplayed', function(newValue, oldValue) {
           // console.log(self.rowsDisplayed);
           // if nothing in data remove elms in columnNamesObjs to hide buttons/columns
           // console.log(newValue);
           //  console.log("Rows changed");
            //@TODO: find out purpose of these lines
           /*if(!(angular.isUndefined(newValue)) && newValue.length == 0){
               self.columnNamesObjs.length = 0;
           }*/
           self.updateCalculations();
        });


        var timeoutPromise;
        var delayInMs = 1000;
        var newWatch  = true;


        // this.onColObjUpdate = function(newValue, oldValue){
        //     console.log("watch fired");
        //     $timeout.cancel(timeoutPromise);  //does nothing, if timeout already done
        //     timeoutPromise = $timeout(function() {   //Set timeout
        //         console.log("timeout fired");
        //
        //         var tableRef = document.getElementById('dataTable');
        //         if(tableRef == null){
        //             return;
        //         }
        //         //console.log("table has this many rows");
        //         //console.log(tableRef.rows.length);
        //
        //         //console.log(self.columnNamesObjs);
        //         //For rows 1, 2 and 3
        //         for (var row = 1; (row < 4) && (row < tableRef.rows.length); row++) {
        //             var colObj;
        //             var tableRow = tableRef.rows[row]; //Get reference to row of table
        //             var c = 0;
        //
        //             //For every cell
        //             for (var col = 0; col < tableRow.cells.length; col++) {
        //                 var tableCell = tableRow.cells[col]; //get cell at position col
        //                 var print = '#' + row + ',' + col + ': ' + tableCell.offsetWidth + " px";
        //                 console.log(print);
        //
        //                 if (row === 3) {
        //                     if (true) {
        //                         tableRef.rows[1].cells[col].style.maxWidth = tableCell.offsetWidth + 'px';
        //                         tableRef.rows[1].cells[col].style.minWidth = tableCell.offsetWidth + 'px';
        //                     }
        //                     else { /* For debugging purposes */
        //                         colObj = self.columnNamesObjs[c];
        //                         console.log("Entering col: " + colObj.name +" isChecked: "+colObj.isChecked);
        //
        //                         if(typeof colObj == 'undefined'){
        //                             console.log('undefined col in timeout')
        //                             continue;
        //                         }
        //                         for (;c  <=  tableRow.cells.length && !colObj.isChecked; c++) {
        //                             console.log("skipping over: " + colObj.name+" isChecked: "+colObj.isChecked);
        //                             colObj = self.columnNamesObjs[c];
        //                         }
        //
        //                         c++;
        //                         console.log("Found: " + colObj.name)
        //                         $scope.$apply(function (){
        //                             //self.columnWidths[col]  = tableCell.offsetWidth + 'px';
        //                             self.columNumWidths[col] = tableCell.offsetWidth + 'px';
        //                         });
        //                         console.log("changing width to: " + tableCell.offsetWidth);
        //                     }
        //                 }
        //             }
        //         }
        //         var headerHeight = document.getElementById('dataTableHead').offsetHeight;
        //         console.log('Timeout: header height: '+headerHeight);
        //         tableRef.style.top = headerHeight + "px";
        //
        //         $scope.$apply(function (){
        //             tableRef.style.top = headerHeight + "px";
        //         });
        //         console.log('Timeout: data table top: '+tableRef.style.top)
        //     }, delayInMs);
        //
        //     var tableRef = document.getElementById('dataTable');
        //     var fixedHeader = document.getElementById('dataTableHead');
        //     if(fixedHeader != null) {
        //         var headerHeight = document.getElementById('dataTableHead').offsetHeight;
        //         //console.log('header height: '+headerHeight);
        //         tableRef.style.top = headerHeight + "px";
        //
        //         //console.log('data table top: '+tableRef.style.top)
        //     }
        // };
        //
        // $scope.$watch('$ctrl.columnNamesObjs', self.onColObjUpdate, true);
        //
        // this.colUpdate = function(column){
        //     //console.log(column.name + " changed");
        // }



    }]
});
