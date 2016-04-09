if (!window.Worker) { alert('Please use a modern browser which supports HTML5 Web Workers'); } 

var Controller = function(ui) {
    
    // private properties
    var tiles, testRunCounters = [];
    
    // private methods
    function init() {
        tiles = createTiles();
        showAvailableTiles();
    }
    
    function showAvailableTiles() {
        for (var i = 0; i < tiles.length; i++) {
            var position = getPosition(i);
            // do a random rotation just for display purposes
            var rotation = Math.floor(4 * Math.random());
            ui.placeTile(position.x, position.y, tiles[i], rotation);
        }
    }
    
    // static helpers    
    function createTiles() {
        var tiles = new Array();
        var colours = ['b', 'g', 'r', 'y'];

        for (var a = 0; a < colours.length; a++)
        for (var b = 0; b < colours.length; b++)
        for (var c = 0; c < colours.length; c++)
        for (var d = 0; d < colours.length; d++) {
            if (a == b || a == c || a == d || b == c || b == d || c == d) {
                continue;
            }
            tiles.push([colours[a], colours[b], colours[c], colours[d]].join(''));
        }
        // 25th tile is a duplicate
        tiles.push('ygrb');
        return tiles;
    }
    
    function getPosition(index) {
        return {
            x: index % 5,
            y: Math.floor(index / 5)
        };
    }
    
    function getAverageOfTestRuns(testRuns) {
        var sum = 0;
        for (var i = 0; i < testRuns.length; i++) {
            sum += testRuns[i].getValue();
        }
        var average = sum / testRuns.length;
        return Math.round(average);
    }
    
    // run init    
    init();

    // public methods
    return {
        findSolution: function() {
            // clear grid
            for (var i = 0; i < tiles.length; i++) {
                var position = getPosition(i);
                ui.removeTile(position.x, position.y);
            }

            // reset counter
            var counter = Counter();
            counter.addOnValueChangedListener(function(val) {
                ui.Counter.innerText = Utils.formatNumber(val);
            });

            var solverWorker = new Worker("js/solverWorker.js");
            solverWorker.onerror = Utils.logError;
            solverWorker.onmessage = function(evt) {
                switch (evt.data.event) {
                    case 'onTileCheckedCountChanged': {
                        counter.increment(evt.data.amount);
                        return;
                    }
                    case 'onTilePlaced': {
                        ui.placeTile(evt.data.position.x, evt.data.position.y, evt.data.tile.definition, evt.data.tile.rotation);
                        return;
                    }
                    case 'onTileRemoved': {
                        ui.removeTile(evt.data.position.x, evt.data.position.y);
                        return;
                    }
                    case 'onSolutionFound': {
                        solverWorker.terminate();
                        return;
                    }
                }
            };
            
            // start worker 
            solverWorker.postMessage({ tiles: tiles });
        },
        randomiseTiles: function() {
            tiles.shuffle();
            showAvailableTiles();
        },
        testAlgorithmPerformance: function(runNumber) {
            var self = this;
            
            if (runNumber == 1) {
                ui.TestAlgorithmPerformanceContainer.style.display = '';
                ui.setStartTime();
            }
            
            self.randomiseTiles();

            var counter = Counter();
            ui.addTestRun(runNumber, counter);
            testRunCounters.push(counter);
            
            var solverWorker = new Worker("js/solverWorker.js");
            solverWorker.onerror = Utils.logError;
            solverWorker.onmessage = function(evt) {
                switch (evt.data.event) {
                    case 'onTileCheckedCountChanged': {
                        counter.increment(evt.data.amount);
                        return;
                    }
                    case 'onSolutionFound': {
                        solverWorker.terminate();
                        if (runNumber < 10) {
                            self.testAlgorithmPerformance(runNumber + 1);
                        }
                        else {
                            ui.setEndTime();
                            ui.addFooter(getAverageOfTestRuns(testRunCounters));
                        }
                        return;
                    }
                }
            }; 

            solverWorker.postMessage({ tiles: tiles, subscribedEvents: ['onTileCheckedCountChanged', 'onSolutionFound'] });    
        }
    }
};