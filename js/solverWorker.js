importScripts('solver.js');

onmessage = OnCreatorMessage; 

var tileCheckedCount = 0;
function onTileChecked() {
    tileCheckedCount++;
    if (tileCheckedCount == 1000) {
        postMessage({ event: 'onTileCheckedCountChanged', amount: tileCheckedCount });
        tileCheckedCount = 0;
    }
}

function onTilePlaced(position, tile) {
    postMessage({ event: 'onTilePlaced', position: position, tile: tile.toMessage() });
}

function onTileRemoved(position) {
    postMessage({ event: 'onTileRemoved', position: position });    
}

function onSolutionFound(tiles) {
    if (tileCheckedCount > 0) {
        postMessage({ event: 'onTileCheckedCountChanged', count: tileCheckedCount });
    }
    postMessage({ event: 'onSolutionFound', tiles: tiles.map(function(t) { return t.toMessage(); }) });        
}

function OnCreatorMessage(evt) {
    var solver = new Solver(evt.data, onTileChecked, onTilePlaced, onTileRemoved);
    var solution = solver.solve();
    onSolutionFound(solution);
}