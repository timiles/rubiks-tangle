var Solver = function(tiles, onTileChecked, onTilePlaced, onTileRemoved) {
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
    self.placedTiles = new Array(25);
    
    var indexSequence = [12, 17, 16, 11, 6, 7, 8, 13, 18, 23, 22, 21, 20, 15, 10, 5, 0, 1, 2, 3, 4, 9, 14, 19, 24];
    
    function getPosition(index) {
        return {
            x: index % 5,
            y: Math.floor(index / 5)
        };
    }
    
    function getGridNumber(position) {
        if (position.x < 0 || position.x > 4) return -1;
        if (position.y < 0 || position.y > 4) return -1;
        return (5 * position.y) + position.x;
    }

    self.getTileIfExists = function(position) {
        var gridNumber = getGridNumber(position);
        if (gridNumber == -1) return undefined;
        return self.placedTiles[gridNumber];
    }

    self.isValidNextTile = function(tile, position) {
        onTileChecked();

        var above = self.getTileIfExists({ x: position.x, y: position.y - 1 });
        if (above) {
            if (above.C() != tile.H() || above.D() != tile.G()) {
                return false;
            }
        }
         
        var right = self.getTileIfExists({ x: position.x + 1, y: position.y });
        if (right) {
            if (right.A() != tile.F() || right.B() != tile.E()) {
                return false;
            }
        } 
        
        var below = self.getTileIfExists({ x: position.x, y: position.y + 1 });
        if (below) {
            if (below.H() != tile.C() || below.G() != tile.D()) {
                return false;
            }
        }
         
        var left = self.getTileIfExists({ x: position.x - 1, y: position.y }); 
        if (left) {
            if (left.F() != tile.A() || left.E() != tile.B()) {
                return false;
            }
        }

        // if we didn't fail already, looks like it's good! hawayyyy!!!
        return true;
    }
    
    self.placeNextTile = function(availableTiles) {
        var sequenceNumber = 25 - availableTiles.length;
        var position = getPosition(indexSequence[sequenceNumber]);
        var triedTiles = new Array();

        while (availableTiles.length > 0) {
            var tile = availableTiles.pop();

            for (var rotation=0; rotation<4; rotation++) {
                tile.setRotation(rotation);

                if (self.isValidNextTile(tile, position)) {
                    // pop it in
                    var gridNumber = getGridNumber(position);
                    self.placedTiles[gridNumber] = tile;
                    onTilePlaced(position, tile);
                    
                    var remainingTiles = availableTiles.concat(triedTiles);
                    if (remainingTiles.length == 0) {
                        // found a solution! return. HAWAYYYYYY!!!!
                        return self.placedTiles;
                    }

                    try {
                        return self.placeNextTile(remainingTiles);
                    }
                    catch (e) {
                        if (e == 'Deadend') {
                            self.placedTiles[gridNumber] = undefined;
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
        return self.placeNextTile(self.tiles);
    }
};