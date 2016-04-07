importScripts('utils.js');
importScripts('solver.js');

onmessage = OnCreatorMessage; 

// default all to true
var subscribedEvents = {
    onTileCheckedCountChanged: true,
    onTilePlaced: true,
    onTileRemoved: true,
    onSolutionFound: true
};

var tileCheckedCount = 0;

function postTileCheckedCountChangedMessage() {
    if (!subscribedEvents.onTileCheckedCountChanged) return;
    postMessage({ event: 'onTileCheckedCountChanged', amount: tileCheckedCount });    
}

function onTileChecked() {
    tileCheckedCount++;
    // only send in incrememnts to improve performance;
    // send 987 cos it makes the counter look more exciting than 1000
    if (tileCheckedCount == 987) {
        postTileCheckedCountChangedMessage();    
        tileCheckedCount = 0;
    }
}

function onTilePlaced(position, tile) {
    if (!subscribedEvents.onTilePlaced) return;
    postMessage({ event: 'onTilePlaced', position: position, tile: tile.toMessage() });
}

function onTileRemoved(position) {
    if (!subscribedEvents.onTileRemoved) return;
    postMessage({ event: 'onTileRemoved', position: position });    
}

function onSolutionFound(tiles) {
    if (tileCheckedCount > 0) {
        postTileCheckedCountChangedMessage();    
    }
    if (!subscribedEvents.onSolutionFound) return;
    postMessage({ event: 'onSolutionFound', tiles: tiles.map(function(t) { return t.toMessage(); }) });        
}

function OnCreatorMessage(evt) {
    if (evt.data.subscribedEvents) {
        for (var e in subscribedEvents) {
            subscribedEvents[e] = (evt.data.subscribedEvents.indexOf(e) >= 0);
        }
    }
    var solver = new Solver(evt.data.tiles, onTileChecked, onTilePlaced, onTileRemoved);
    var solution = solver.solve();
    onSolutionFound(solution);
}