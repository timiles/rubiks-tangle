
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
var counter = new Counter(function(value) {
    if (value % 100 == 0) {
        displayCounterValue(value);
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
function displayCounterValue(count) {
    counterP.innerText = Number(count).toLocaleString();    
}

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
    while (availableTilesDiv.childNodes.length > 0) {
        availableTilesDiv.removeChild(availableTilesDiv.childNodes[0]);
    }
    
    for (var i = 0; i < tiles.length; i++) {
        availableTilesDiv.appendChild(createTileDiv(tiles[i]));
    }
}

function randomiseTiles() {
    shuffle(tiles);
    showAvailableTiles();    
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
            displayCounterValue(counter.value);
            return;
        }
    }
}

function findSolution() {    
    var solverWorker = new Worker("js/solverWorker.js");
    solverWorker.onerror = logError;
    solverWorker.onmessage = onSolverWorkerMessage; 
    solverWorker.postMessage(tiles);
}
