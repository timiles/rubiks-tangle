importScripts('solver.js');

onmessage = OnCreatorMessage; 

function onTilePlaced(position, tile) {
    postMessage({ event: 'onTilePlaced', position: position, tile: tile.toMessage() });
}

function onTileRemoved(position) {
    postMessage({ event: 'onTileRemoved', position: position });    
}

function OnCreatorMessage(evt) {
    var solver = new TangleSolver(evt.data, onTilePlaced, onTileRemoved);
    solver.solve();
}