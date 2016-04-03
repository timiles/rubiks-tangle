var UI = function(dom) {
    var self = this;

    self.TileGrid = createTileGrid();
    
    self.Counter = dom.getElementById('counter');
    self.TestAlgorithmPerformanceContainer = dom.getElementById('testAlgorithmPerformanceContainer');
    self.ResultsTable = dom.getElementById("algorithmPerformanceResults");
    self.StartTime = dom.getElementById('startTime');
    self.EndTime = dom.getElementById('endTime');
    
    self.btnShuffle = dom.getElementById('btnShuffle');
    self.btnSolve = dom.getElementById('btnSolve');
    self.btnStartPerformanceTest = dom.getElementById('btnStartPerformanceTest');
    
    self.placeTile = function(x, y, definition, rotation) {
        self.TileGrid[y][x].style.backgroundImage = 'url(img/' + definition + '.png)';
        self.TileGrid[y][x].style.transform = getTransformStyleForRotation(rotation);
    };

    self.removeTile = function(x, y) {
        self.TileGrid[y][x].style.backgroundImage = '';
    };

    self.setStartTime = function() {
        setAsCurrentTime(self.StartTime);
    };
    
    self.setEndTime = function() {
        setAsCurrentTime(self.EndTime);
    };
    
    self.addTestRun = function(runNumber, counter) {
        
        var tr = dom.createElement('tr');
        var runTd = dom.createElement('td');
        runTd.innerText = runNumber.toString();
        
        var counterTd = dom.createElement('td');
        counter.onValueChanged = function() {
            counterTd.innerText = this.getValueFormatted();
        }
        
        tr.appendChild(runTd);
        tr.appendChild(counterTd);
        self.ResultsTable.appendChild(tr);
    };
    
    self.addFooter = function(average) { 

        var runTd = dom.createElement('td');
        runTd.innerText = 'AVERAGE';
        
        var averageTd = dom.createElement('td');
        averageTd.innerText = Number(average).toLocaleString();
        
        var tr = dom.createElement('tr');
        tr.appendChild(runTd);
        tr.appendChild(averageTd);

        var tfoot = dom.createElement('tfoot');
        tfoot.appendChild(tr);
        self.ResultsTable.appendChild(tfoot);            
    };

    function createTileGrid() {
        var tileGrid = new Array();
        var tileGridTable = dom.getElementById('tileGrid');
        for (var y = 0; y < 5; y++) {
            var tr = dom.createElement('tr');
            var tiles = new Array();
            for (var x = 0; x < 5; x++) {
                var td = dom.createElement('td');
                var tileDiv = createTileDiv();
                td.appendChild(tileDiv);
                tiles.push(tileDiv);
                tr.appendChild(td);
            }
            tileGridTable.appendChild(tr);
            tileGrid.push(tiles);
        }
        return tileGrid;
    }

    function getTransformStyleForRotation(rotation) {
        switch (rotation) {
            case 0: return '';
            case 1: return 'rotate(90deg)';
            case 2: return 'rotate(180deg)';
            case 3: return 'rotate(270deg)';
        }
    }

    function createTileDiv(tileDefinition) {
        var tileDiv = dom.createElement('div');
        tileDiv.className = 'tile';
        if (tileDefinition) {
            tileDiv.style.backgroundImage = 'url(img/' + tileDefinition + '.png)';
        }
        return tileDiv;
    }

    function setAsCurrentTime(el) {
        el.innerText = new Date().toLocaleTimeString();
    }
    
};
