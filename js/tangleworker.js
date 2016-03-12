importScripts('tangle.js');

onmessage = OnCreatorMessage; 

function onTilePlaced(position, tile) {
    postMessage({ event: 'onTilePlaced', position: position, tile: tile.toMessage() });
}

function onTileRemoved(position) {
    postMessage({ event: 'onTileRemoved', position: position });    
}

function OnCreatorMessage(evt) {
    if (evt.data == 'start') {
        var tiles = createTiles();
        var solver = new TangleSolver(tiles, onTilePlaced, onTileRemoved);
        solver.solve();
    }
}