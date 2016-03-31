
// UI Elements
document.addEventListener("DOMContentLoaded", function(event) {
   UI = new UI(document);
});

var UI = function(dom) {
    var self = this;

    self.TileGrid = createTileGrid();
    
    self.Counter = dom.getElementById('counter');
    self.TestAlgorithmPerformanceContainer = dom.getElementById('testAlgorithmPerformanceContainer');
    self.ResultsTable = dom.getElementById("algorithmPerformanceResults");
    self.StartTime = dom.getElementById('startTime');
    self.EndTime = dom.getElementById('endTime');
    
    self.placeTile = function(x, y, definition, rotation) {
        UI.TileGrid[y][x].style.backgroundImage = 'url(img/' + definition + '.png)';
        UI.TileGrid[y][x].style.transform = getTransformStyleForRotation(rotation);
    };

    self.removeTile = function(x, y) {
        UI.TileGrid[y][x].style.backgroundImage = '';
    };

    self.setStartTime = function() {
        setAsCurrentTime(UI.StartTime);
    };
    
    self.setEndTime = function() {
        setAsCurrentTime(UI.EndTime);
    };
    
    self.addTestRun = function(testRun) {
        
        var tr = document.createElement('tr');
        var runTd = document.createElement('td');
        runTd.innerText = testRun.runNumber.toString();
        
        var counterTd = document.createElement('td');
        testRun.counter.onValueChanged = function() {
            counterTd.innerText = this.getValueFormatted();
        }
        
        tr.appendChild(runTd);
        tr.appendChild(counterTd);
        UI.ResultsTable.appendChild(tr);

    };
    self.addFooter = function(average) { 

        var runTd = document.createElement('td');
        runTd.innerText = 'AVERAGE';
        
        var averageTd = document.createElement('td');
        averageTd.innerText = Number(average).toLocaleString();
        
        var tr = document.createElement('tr');
        tr.appendChild(runTd);
        tr.appendChild(averageTd);

        var tfoot = document.createElement('tfoot');
        tfoot.appendChild(tr);
        UI.ResultsTable.appendChild(tfoot);            
    };

    function createTileGrid() {
        var tileGrid = new Array();
        var tileGridTable = document.getElementById('tileGrid');
        for (var y = 0; y < 5; y++) {
            var tr = document.createElement('tr');
            var tiles = new Array();
            for (var x = 0; x < 5; x++) {
                var td = document.createElement('td');
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
        var tileDiv = document.createElement('div');
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
