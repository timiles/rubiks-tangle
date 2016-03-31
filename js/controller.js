if (!window.Worker) { alert('Please use a modern browser which supports HTML5 Web Workers'); } 

var Controller = function(UI) {
    var self = this;
    
    self.counter = new Counter();
    self.tiles = createTiles();
    self.testRuns = new Array();
    self.currentTestRun = undefined;

    self.randomiseTiles = function() {
        shuffle(self.tiles);
        showAvailableTiles();    
    };
    
    self.findSolution = function() {
        // clear grid
        for (var i = 0; i < self.tiles.length; i++) {
            var position = getPosition(i);
            UI.removeTile(position.x, position.y);
        }
        // reset counter
        self.counter.reset();
        
        var solverWorker = new Worker("js/solverWorker.js");
        solverWorker.onerror = logError;
        solverWorker.onmessage = onSolverWorkerMessage; 
        solverWorker.postMessage({ tiles: self.tiles });
    };
    
    self.testAlgorithmPerformance = function(runNumber) {
        runNumber = runNumber || 1;
        if (runNumber == 1) {
            UI.TestAlgorithmPerformanceContainer.style.display = '';
            UI.setStartTime();
        }
        
        self.randomiseTiles();
        
        var solverWorker = new Worker("js/solverWorker.js");
        solverWorker.onerror = logError;
        solverWorker.onmessage = onPerformanceTestMessage; 

        self.currentTestRun = new TestRun(runNumber, new Counter(), solverWorker);
        UI.addTestRun(self.currentTestRun);
        self.testRuns.push(self.currentTestRun);

        solverWorker.postMessage({ tiles: self.tiles, subscribedEvents: ['onTileCheckedCountChanged', 'onSolutionFound'] });    
    }

    init();
    
    function init() {
        self.counter.onValueChanged = function() {
            UI.Counter.innerText = this.getValueFormatted();
        };
        showAvailableTiles();
    }
    
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

    function showAvailableTiles() {
        for (var i = 0; i < self.tiles.length; i++) {
            var position = getPosition(i);
            // do a random rotation just for display purposes
            var rotation = Math.floor(4 * Math.random());
            UI.placeTile(position.x, position.y, self.tiles[i], rotation);
        }
    }
    
    function getAverageOfTestRuns(testRuns) {
        var sum = 0;
        for (var i = 0; i < testRuns.length; i++) {
            sum += testRuns[i].counter.value;
        }
        var average = sum / testRuns.length;
        return Math.round(average);
    }

    function onSolverWorkerMessage(evt) {
        switch (evt.data.event) {
            case 'onTileCheckedCountChanged': {
                self.counter.increment(evt.data.amount);
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

    function onPerformanceTestMessage(evt) {
        switch (evt.data.event) {
            case 'onTileCheckedCountChanged': {
                self.currentTestRun.counter.increment(evt.data.amount);
                return;
            }
            case 'onSolutionFound': {
                self.currentTestRun.solverWorker.terminate();
                if (self.currentTestRun.runNumber < 10) {
                    self.testAlgorithmPerformance(self.currentTestRun.runNumber + 1);
                }
                else {
                    UI.setEndTime();
                    UI.addFooter(getAverageOfTestRuns(self.testRuns));
                }
                return;
            }
        }
    }
   
};


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