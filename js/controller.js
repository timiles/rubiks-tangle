if (!window.Worker) { alert('Please use a modern browser which supports HTML5 Web Workers'); } 

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

function getPosition(index) {
    return {
        x: index % 5,
        y: Math.floor(index / 5)
    };
}

// commands
function showAvailableTiles() {
    for (var i = 0; i < tiles.length; i++) {
        var position = getPosition(i);
        // do a random rotation just for display purposes
        var rotation = Math.floor(4 * Math.random());
        UI.placeTile(position.x, position.y, tiles[i], rotation);
    }
}



function randomiseTiles() {
    shuffle(tiles);
    showAvailableTiles();    
}

function onSolverWorkerMessage(evt) {
    switch (evt.data.event) {
        case 'onTileCheckedCountChanged': {
            counter.increment(evt.data.amount);
            return;
        }
        case 'onTilePlaced': {
            UI.placeTile(evt.data.position.x, evt.data.position.y, evt.data.tile.definition, evt.data.tile.rotation);
            return;
        }
        case 'onTileRemoved': {
            UI.removeTile(evt.data.position.x, evt.data.position.y);
            return;
        }
    }
}

function findSolution() {
    // clear grid
    for (var i = 0; i < tiles.length; i++) {
        var position = getPosition(i);
        UI.removeTile(position.x, position.y);
    }
    // reset counter
    counter.reset();
    
    var solverWorker = new Worker("js/solverWorker.js");
    solverWorker.onerror = logError;
    solverWorker.onmessage = onSolverWorkerMessage; 
    solverWorker.postMessage({ tiles: tiles });
}


var testRuns = new Array();
var currentTestRun;

function getAverageOfTestRuns() {
    var sum = 0;
    for (var i = 0; i < testRuns.length; i++) {
        sum += testRuns[i].counter.value;
    }
    var average = sum / testRuns.length;
    return Math.round(average);
}

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
                UI.setEndTime();
                UI.addFooter(getAverageOfTestRuns());
            }
            return;
        }
    }
}

function testAlgorithmPerformance(runNumber) {
    runNumber = runNumber || 1;
    if (runNumber == 1) {
        UI.TestAlgorithmPerformanceContainer.style.display = '';
        UI.setStartTime();
    }
    
    randomiseTiles();
    
    var solverWorker = new Worker("js/solverWorker.js");
    solverWorker.onerror = logError;
    solverWorker.onmessage = onPerformanceTestMessage; 

    currentTestRun = new TestRun(runNumber, new Counter(), solverWorker);
    UI.addTestRun(currentTestRun);
    testRuns.push(currentTestRun);

    solverWorker.postMessage({ tiles: tiles, subscribedEvents: ['onTileCheckedCountChanged', 'onSolutionFound'] });    
}

