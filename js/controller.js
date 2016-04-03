if (!window.Worker) { alert('Please use a modern browser which supports HTML5 Web Workers'); } 

var Controller = function(ui) {
    var self = this;
        
    // ui actions
    ui.btnShuffle.onclick = function() {
        self.randomiseTiles();
    }
    ui.btnSolve.onclick = function() {
        self.findSolution();
    }; 
    ui.btnStartPerformanceTest.onclick = function() {
        self.testAlgorithmPerformance(1);
    }
    
    // initialise properties
    self.counter = new Counter();
    self.tiles = createTiles();
    self.testRuns = new Array();
    self.currentTestRun = undefined;
    
    // methods
    self.init = function() {
        self.counter.onValueChanged = function() {
            ui.Counter.innerText = this.getValueFormatted();
        };
        self.showAvailableTiles();
    }
    
    self.randomiseTiles = function() {
        shuffle(self.tiles);
        self.showAvailableTiles();
    };
    
    self.showAvailableTiles = function() {
        for (var i = 0; i < self.tiles.length; i++) {
            var position = getPosition(i);
            // do a random rotation just for display purposes
            var rotation = Math.floor(4 * Math.random());
            ui.placeTile(position.x, position.y, self.tiles[i], rotation);
        }
    }
    
    self.findSolution = function() {
        // clear grid
        for (var i = 0; i < self.tiles.length; i++) {
            var position = getPosition(i);
            ui.removeTile(position.x, position.y);
        }
        // reset counter
        self.counter.reset();
        
        var solverWorker = new Worker("js/solverWorker.js");
        solverWorker.onerror = logError;
        solverWorker.onmessage = function(evt) {
            switch (evt.data.event) {
                case 'onTileCheckedCountChanged': {
                    self.counter.increment(evt.data.amount);
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
            }
        };
        
        // start worker 
        solverWorker.postMessage({ tiles: self.tiles });
    };
    
    self.testAlgorithmPerformance = function(runNumber) {
        if (runNumber == 1) {
            ui.TestAlgorithmPerformanceContainer.style.display = '';
            ui.setStartTime();
        }
        
        self.randomiseTiles();
        
        var solverWorker = new Worker("js/solverWorker.js");
        solverWorker.onerror = logError;
        solverWorker.onmessage = function(evt) {
            switch (evt.data.event) {
                case 'onTileCheckedCountChanged': {
                    self.currentTestRun.counter.increment(evt.data.amount);
                    return;
                }
                case 'onSolutionFound': {
                    debugger;
                    self.currentTestRun.solverWorker.terminate();
                    if (self.currentTestRun.runNumber < 10) {
                        self.testAlgorithmPerformance(self.currentTestRun.runNumber + 1);
                    }
                    else {
                        ui.setEndTime();
                        ui.addFooter(getAverageOfTestRuns(self.testRuns));
                    }
                    return;
                }
            }
        }; 

        var testRun = new TestRun(runNumber, new Counter(), solverWorker);
        ui.addTestRun(testRun);
        self.testRuns.push(testRun);
        self.currentTestRun = testRun; 
        
        solverWorker.postMessage({ tiles: self.tiles, subscribedEvents: ['onTileCheckedCountChanged', 'onSolutionFound'] });    
    }

    // run init    
    self.init();

    // static helpers    
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
    
    function getPosition(index) {
        return {
            x: index % 5,
            y: Math.floor(index / 5)
        };
    }
    
    function getAverageOfTestRuns(testRuns) {
        var sum = 0;
        for (var i = 0; i < testRuns.length; i++) {
            sum += testRuns[i].counter.value;
        }
        var average = sum / testRuns.length;
        return Math.round(average);
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
   
};