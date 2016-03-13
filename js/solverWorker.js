importScripts('solver.js');

onmessage = OnCreatorMessage; 

function onTilePlaced(position, tile) {
    postMessage({ event: 'onTilePlaced', position: position, tile: tile.toMessage() });
}

function onTileRemoved(position) {
    postMessage({ event: 'onTileRemoved', position: position });    
}

function onSolutionFound(tiles) {
    postMessage({ event: 'onSolutionFound', tiles: tiles.map(function(t) { return t.toMessage(); }) });        
}

function OnCreatorMessage(evt) {
    var solver = new Solver(evt.data, onTilePlaced, onTileRemoved);
    var solution = solver.solve();
    onSolutionFound(solution);
}