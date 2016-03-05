var Tile = function(a, b, c, d) {
	var self = this;
    self.definition = a + b + c + d;
	self.ends = a + b + c + d + c + a + b + d;

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
};

var TangleSolver = function(tiles) {
    var self = this;
    self.tiles = tiles;
    
    var isValidNextTile = function(placedTiles, tile) {
        var position = placedTiles.length;
        if (position == 0) { return true; }
        if (position % 5 != 0) {
            // not start of row: check against tile to its left
            var left = placedTiles[position - 1];
            if (left.F() != tile.A() || left.E() != tile.B()) {
                return false;
            }
        }
        if (position > 4) {
            // not top row: check against tile above
            var above = placedTiles[position - 5];
            if (above.C() != tile.H() || above.D() != tile.G()) {
                return false;
            }
        }

        // if we didn't fail already, looks like it's good! hawayyyy!!!
        return true;
    }

    function placeNextTile(placedTiles, availableTiles) {
        var triedTiles = new Array();

        while (availableTiles.length > 0) {
            var tile = availableTiles.pop();

            for (var rotation=0; rotation<4; rotation++) {
                tile.setRotation(rotation);

                if (isValidNextTile(placedTiles, tile)) {
                    // pop it in
                    placedTiles.push(tile);
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
        tiles.push(new Tile(colours[a], colours[b], colours[c], colours[d]));
    }
    // 25th tile is a duplicate
    tiles.push(new Tile('y', 'g', 'r', 'b'));
    return tiles;
}
