var Solver = function(tiles, onTilePlaced, onTileRemoved) {
    var self = this;

    var Tile = function(definition) {
        var self = this;
        self.definition = definition;
        self.ends = definition + definition[2] + definition[0] + definition[1] + definition[3];

        self.rotation = 0;
        self.setRotation = function(rotation) {
            if (rotation < 0 || rotation >= 4) {
                throw 'Invalid rotation: ' + rotation;
            }
            self.rotation = rotation;
        }
        
        self.getEnd = function(location) {
            return self.ends[(location + (2 * self.rotation)) % 8];
        }
        self.A = function() { return self.getEnd(0); }
        self.B = function() { return self.getEnd(1); }
        self.C = function() { return self.getEnd(2); }
        self.D = function() { return self.getEnd(3); }
        self.E = function() { return self.getEnd(4); }
        self.F = function() { return self.getEnd(5); }
        self.G = function() { return self.getEnd(6); }
        self.H = function() { return self.getEnd(7); }

        self.info = function() { return self.ends + ", " + self.rotation; }
        
        // return object without functions for structured cloning
        self.toMessage = function() { return { definition: self.definition, rotation: self.rotation } };
    };

    self.tiles = tiles.map(function(definition) { return new Tile(definition); });
    
    var getPosition = function(index) {
        return {
            x: index % 5,
            y: Math.floor(index / 5)
        };
    }

    var isValidNextTile = function(placedTiles, tile) {
        var index = placedTiles.length;
        if (index == 0) { return true; }
        var position = getPosition(index);
        if (position.x > 0) {
            // not start of row: check against tile to its left
            var left = placedTiles[index - 1];
            if (left.F() != tile.A() || left.E() != tile.B()) {
                return false;
            }
        }
        if (position.y > 0) {
            // not top row: check against tile above
            var above = placedTiles[index - 5];
            if (above.C() != tile.H() || above.D() != tile.G()) {
                return false;
            }
        }

        // if we didn't fail already, looks like it's good! hawayyyy!!!
        return true;
    }
    
    function placeNextTile(placedTiles, availableTiles) {
        var position = getPosition(placedTiles.length);
        var triedTiles = new Array();

        while (availableTiles.length > 0) {
            var tile = availableTiles.pop();

            for (var rotation=0; rotation<4; rotation++) {
                tile.setRotation(rotation);

                if (isValidNextTile(placedTiles, tile)) {
                    // pop it in
                    placedTiles.push(tile);
                    onTilePlaced(position, tile);
                    
                    if (placedTiles.length == 25) {
                        // found a solution! return. HAWAYYYYYY!!!!
                        return placedTiles;
                    }

                    try {
                        return placeNextTile(placedTiles, availableTiles.concat(triedTiles));
                    }
                    catch (e) {
                        if (e == 'Deadend') {
                            placedTiles.pop();
                            onTileRemoved(position);
                        }
                        else { throw e; }
                    }

                }
            }
            // if no dice, put this tile on the used list
            triedTiles.push(tile);
        }

        // if we ran out of tiles, we dun goofed. throw up;
        throw 'Deadend';
    }
    
    self.solve = function() {
        return placeNextTile(new Array(), self.tiles);
    }
};