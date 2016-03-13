
if (!window.Worker) { alert('Please use a modern browser which supports HTML5 Web Workers'); } 

// UI Elements
document.addEventListener("DOMContentLoaded", function(event) {
    counterP = document.getElementById('counter');
    
    tileDivs = new Array();
    var solutionTable = document.getElementById('solution');
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
        tileDivs.push(tiles);
        solutionTable.appendChild(tr);
    }    
});

// Counter
var counter = new Counter(function(count) {
    if (count % 100 == 0) {
        counterP.innerText = count;
    }
});

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
    var availableTilesDiv = document.getElementById('availableTiles');
    
    for (var i = 0; i < tiles.length; i++) {
        availableTilesDiv.appendChild(createTileDiv(tiles[i]));
    }
}

function placeTile(x, y, definition, rotation) {
    tileDivs[y][x].style.backgroundImage = 'url(img/' + definition + '.png)';
    tileDivs[y][x].style.transform = getTransformStyleForRotation(rotation);
    counter.increment();
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
    tileDivs[y][x].style.backgroundImage = '';
}

function onSolverWorkerMessage(evt) {
    switch (evt.data.event) {
        case 'onTilePlaced': {
            placeTile(evt.data.position.x, evt.data.position.y, evt.data.tile.definition, evt.data.tile.rotation);
            return;
        }
        case 'onTileRemoved': {
            removeTile(evt.data.position.x, evt.data.position.y);
            return;
        }
        case 'onSolutionFound': {
            counterP.innerText = counter.count;
            return;
        }
    }
}

function findSolution() {    
    var solverWorker = new Worker("js/solverWorker.js");
    solverWorker.onerror = logError;
    solverWorker.onmessage = onSolverWorkerMessage; 
    solverWorker.postMessage(createTiles());
}

function logError(e) {
    alert(e.message + ' -- ' + e.filename + ': line ' + e.lineno);
    console.error(e);
}