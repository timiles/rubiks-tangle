
if (!window.Worker) { alert('Please use a modern browser which supports HTML5 Web Workers'); } 

// UI Elements
document.addEventListener("DOMContentLoaded", function(event) {
    UI = {
        TileGrid: createTileGrid(),
        Counter: document.getElementById('counter'),
        TestAlgorithmPerformanceContainer: document.getElementById('testAlgorithmPerformanceContainer'),
        ResultsTable: document.getElementById("algorithmPerformanceResults"),
        StartTime: document.getElementById('startTime'),
        EndTime: document.getElementById('endTime'),
        
        addTestRun: function(testRun) {
            
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
    
        }       
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
});

// Counter
var counter = new Counter();
counter.onValueChanged = function() {
    UI.Counter.innerText = this.getValueFormatted();
};

// Tiles
var tiles = createTiles();

function createTiles() {
    var tiles = new Array();
    var colours = ['b', 'g', 'r', 'y'];

    for (var a in colours)
    for (var b in colours)
    for (var c in colours)
    for (var d in colours) {
        if (a == b || a == c || a == d || b == c || b == d || c == d) {
            continue;
        }
        tiles.push([colours[a], colours[b], colours[c], colours[d]].join(''));
    }
    // 25th tile is a duplicate
    tiles.push('ygrb');
    return tiles;
}

// utils
// REF: http://stackoverflow.com/a/2450976/487544
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function logError(e) {
    alert(e.message + ' -- ' + e.filename + ': line ' + e.lineno);
    console.error(e);
}

// UI Helpers
function createTileDiv(tileDefinition) {
    var tileDiv = document.createElement('div');
    tileDiv.className = 'tile';
    if (tileDefinition) {
        tileDiv.style.backgroundImage = 'url(img/' + tileDefinition + '.png)';
    }
    return tileDiv;
}

function showAvailableTiles() {
    for (var i = 0; i < tiles.length; i++) {
        var position = getPosition(i);
        // do a random rotation just for display purposes
        var rotation = Math.floor(4 * Math.random());
        placeTile(position.x, position.y, tiles[i], rotation);
    }
}

function getPosition(index) {
    return {
        x: index % 5,
        y: Math.floor(index / 5)
    };
}

function randomiseTiles() {
    shuffle(tiles);
    showAvailableTiles();    
}

function placeTile(x, y, definition, rotation) {
    UI.TileGrid[y][x].style.backgroundImage = 'url(img/' + definition + '.png)';
    UI.TileGrid[y][x].style.transform = getTransformStyleForRotation(rotation);
}

function getTransformStyleForRotation(rotation) {
    switch (rotation) {
        case 0: return '';
        case 1: return 'rotate(90deg)';
        case 2: return 'rotate(180deg)';
        case 3: return 'rotate(270deg)';
    }
}

function removeTile(x, y) {
    UI.TileGrid[y][x].style.backgroundImage = '';
}

function onSolverWorkerMessage(evt) {
    switch (evt.data.event) {
        case 'onTileCheckedCountChanged': {
            counter.increment(evt.data.amount);
            return;
        }
        case 'onTilePlaced': {
            placeTile(evt.data.position.x, evt.data.position.y, evt.data.tile.definition, evt.data.tile.rotation);
            return;
        }
        case 'onTileRemoved': {
            removeTile(evt.data.position.x, evt.data.position.y);
            return;
        }
    }
}

function findSolution() {
    // clear grid
    for (var i = 0; i < tiles.length; i++) {
        var position = getPosition(i);
        removeTile(position.x, position.y);
    }
    // reset counter
    counter.reset();
    
    var solverWorker = new Worker("js/solverWorker.js");
    solverWorker.onerror = logError;
    solverWorker.onmessage = onSolverWorkerMessage; 
    solverWorker.postMessage({ tiles: tiles });
}


function setAsCurrentTime(el) {
    el.innerText = new Date().toLocaleTimeString();
}

var currentTestRun;

function onPerformanceTestMessage(evt) {
    switch (evt.data.event) {
        case 'onTileCheckedCountChanged': {
            currentTestRun.counter.increment(evt.data.amount);
            return;
        }
        case 'onSolutionFound': {
            currentTestRun.solverWorker.terminate();
            if (currentTestRun.runNumber < 10) {
                testAlgorithmPerformance(currentTestRun.runNumber + 1);
            }
            else {
                setAsCurrentTime(UI.EndTime);
            }
            return;
        }
    }
}

function testAlgorithmPerformance(runNumber) {
    runNumber = runNumber || 1;
    if (runNumber == 1) {
        UI.TestAlgorithmPerformanceContainer.style.display = '';
        setAsCurrentTime(UI.StartTime);
    }
    
    randomiseTiles();
    
    var solverWorker = new Worker("js/solverWorker.js");
    solverWorker.onerror = logError;
    solverWorker.onmessage = onPerformanceTestMessage; 

    currentTestRun = new TestRun(runNumber, new Counter(), solverWorker);
    UI.addTestRun(currentTestRun);

    solverWorker.postMessage({ tiles: tiles, subscribedEvents: ['onTileCheckedCountChanged', 'onSolutionFound'] });    
}