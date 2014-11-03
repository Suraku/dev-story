game.module(
    'modules.optimize.objects'
)
.require(
    'engine.camera',
    'engine.core',
    'engine.loader',
    'engine.scene',
    'engine.renderer',
    'engine.particle',
    'engine.system',
    'engine.timer',
    'engine.tween'
)
.body(function() {
    
    App.Optimize.SplitImage = game.Class.extend({
        
        init: function(){
            
            var level = game.storage.get("CurrentLevel");
            var gridLines = game.scene.gridLines;
            var IMAGE_TEXTURE = game.scene.puzzle_Original_Texture;
            
            // Get the background so we know our placement boundaries.
            var gridBackground = game.scene.gridBackgroundArea;
            
            // Setup the puzzle container and it's location.
            var PUZZLE_CONTAINER = game.scene.puzzleContainer;
            
            var splitImages = [];
            
            
            // Split the image into an array of images based on difficulty.
            var tileTextureWidth = Math.floor(IMAGE_TEXTURE.width / gridLines);
            var tileTextureHeight = Math.floor(IMAGE_TEXTURE.height / gridLines);
            
            // Need to define co-ordinates, top-left, of each tile. 
            // Create an array for each row, then add each array to the main array.
            
            // Loop through each row, creating the sprites.
            for (i = 0; i < gridLines; i++) {
                var rowArray = [];
                var y_value = i * tileTextureHeight;
                
                // Loop through each item on that row
                for (j = 0; j < gridLines; j++) {
                    var x_value = j * tileTextureWidth;
                    
                    var texture = IMAGE_TEXTURE;
                    var standardTileSprite = new game.PIXI.Sprite(texture);
                    
                    var tileTexture = new game.PIXI.Texture(texture, new game.PIXI.Rectangle(x_value, y_value, tileTextureWidth, tileTextureHeight));
                    standardTileSprite.setTexture(tileTexture);
                    
                    rowArray.push(standardTileSprite);
                }
                
                // Add to the main array.
                splitImages.push(rowArray);
            }
            
            // Setup arrays to process the images in preparation for sizing and positioning.
            var fullJoinedArray = [];
            var fullIndexedSprites = [];
            this.indexedSlicedSprites = [];
            
            var TILE_GAP = Math.round(gridBackground.width * 0.01);
            var tileSpriteLength = Math.round((gridBackground.width - (TILE_GAP * (gridLines - 1))) / gridLines);
            
            // Join the row arrays into one single array.
            for (index = 0; index < gridLines; index++) {
                fullJoinedArray = fullJoinedArray.concat(splitImages[index]);
            }
            
            // Add an index value to each element, so we know how to identify them post-shuffle.
            for (i = 0; i < fullJoinedArray.length; i++) {
                fullIndexedSprites.push( [i, fullJoinedArray[i]] );
            }
            fullIndexedSprites = fullIndexedSprites.shuffle();
            
            
            // Must check if this is solvable.
            var isSolvable = this.IsSolvable(fullIndexedSprites);
            while (!isSolvable) {
                fullIndexedSprites = fullIndexedSprites.shuffle();
                isSolvable = this.IsSolvable(fullIndexedSprites);
            }
            
            
            // Slice our array back into rows ready for placement.
            for (i = 0; i < gridLines; i++) {
                var slicedArray = fullIndexedSprites.slice((i * gridLines), ((i + 1) * gridLines));
                this.indexedSlicedSprites.push(slicedArray);
            }
            
            self = this;
            
            // Loop through each row, resizing the sprites and placing them. First the rows.
            for (i = 0; i < gridLines; i++) {
                // Cover the far edge by repositioning the x and y slightly.
                var y_addDividedTileSeperation = Math.round(TILE_GAP / (gridLines - 1));
                
                var sprite_y_value = (i * tileSpriteLength) + (i * y_addDividedTileSeperation);
                
                // Now loop the items in this row.
                for (j = 0; j < gridLines; j++) {
                    var sprite = this.indexedSlicedSprites[i][j][1];
                    sprite.width = tileSpriteLength - TILE_GAP;
                    sprite.height = tileSpriteLength - TILE_GAP;
                    
                    var x_addDividedTileSeperation = Math.round(TILE_GAP / (gridLines - 1));
                    
                    var sprite_x_value = (j * tileSpriteLength) + (j * x_addDividedTileSeperation);
                    sprite.position.x = sprite_x_value + game.scene.gridDistanceToEdge;
                    sprite.position.y = sprite_y_value + game.scene.y_gridBackgroundPosition;
                    
                    // Find the final indexed sprite and make invisible.
                    if (this.indexedSlicedSprites[i][j][0] == ((gridLines * gridLines) - 1)) {
                        sprite.alpha = 0;
                    }
                    
                    // Add the sprite to the stage.
                    PUZZLE_CONTAINER.addChild(sprite);
                }
            }
            
            return this;
        },
        
        IsSolvable: function(tileArray){
         
            var numberOfInversions = 0;
            var blankTilePosition;    // i value
            
            // We must check over each tile, and find its position, then calculate the number of 
            // tiles which precede our selected tile which have a lower index value.
            for (i = 0; i < tileArray.length; i++) {
                var selectedTileIndex = tileArray[i][0];
                var selectedTileFound = false;
                
                // Skip the blank tile
                if (selectedTileIndex === tileArray.length - 1) {
                    blankTilePosition = selectedTileIndex;
                    continue;
                }
                
                // Now find its position in the array.
                for (j = 0; j < tileArray.length; j++) {
                    if (tileArray[j][0] !== selectedTileIndex && !selectedTileFound) {
                        continue;
                    }
                    selectedTileFound = true;
                    
                    if (tileArray[j][0] < selectedTileIndex) {
                        numberOfInversions++;
                    }
                }
            }
            
            // Now we have our inversions, we can see if this puzzle structure is solvable.
            if (game.scene.gridLines % 2 == 0) {    // Even
                // Find which row the blank tile falls on
                var rowNumber = this.blankTileRowPosition(tileArray);
                if (rowNumber % 2 == 0) {   // Even row { 2, 4, 6... }
                    // Odd number of inversions required to be solved
                    if (numberOfInversions % 2 == 0) {
                        return false;
                    } else {
                        return true;
                    }
                    
                } else {    // Odd row { 1, 3, 5... }
                    // Even number of inversions required to be solved
                    if (numberOfInversions % 2 == 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
                
            } else {    // Odd
                // Must be even number of inversions to be solvable.
                if (numberOfInversions % 2 == 0) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        
        blankTileRowPosition: function(tileArray){
        
            var tileGrid = [], rowValue = 0, tileFound = false;
            
            // Slice the array into a grid, to help us determine where the blank tile lies.
            for (i = 0; i < game.scene.gridLines; i++) { 
                var slicedArray = tileArray.slice((i * game.scene.gridLines), ((i + 1) * game.scene.gridLines));
                tileGrid.push(slicedArray);
            }
            
            // Work our way through the rows
            for (i = 0; i < game.scene.gridLines; i++) {
                // Make sure we stop once the tile is found.
                if (tileFound) {
                    break;
                }
                rowValue++;
                
                for (j = 0; j < game.scene.gridLines; j++){
                    var tileIndex = tileGrid[i][j][0];
                    if (tileIndex === tileArray.length - 1) {
                        tileFound = true;
                        break;
                    }
                }
            }
            
            return rowValue;
        }
    });
    
    App.Optimize.PuzzleTimer = game.Class.extend({
        
        init: function(){
            
            // Countdown text
            this.text = new game.BitmapText( "Test", { font: 'Roboto-export' });

            // Countdown position
            this.location = new game.Vector(0, 32);

            // Tint
            this.text.tint = 0x010101;
            
            // Store the default text size
            this.defaultTextSize = this.text.fontSize;

            // Display time
            this.displayTime = game.scene.stopwatch;
            
            // Add to scene
            game.scene.container.addChild(this.text);
            game.scene.addObject(this);

        },
        
        update: function(){

            var textWidth, textHeight;

            // Update timeleft
            game.scene.stopwatch += App.getDelta();
            game.scene.stopwatch = Math.max(game.scene.stopwatch, 0);
            
            // Set a timeout
            if (game.scene.stopwatch >= 600) {
                game.scene.endGame();
            }
            
            // Convert the time into a format to be displayed to the user.
            this.displayTime = this.timeFormat(game.scene.stopwatch);
            
            // Update display
            this.text.setText(this.displayTime);
            
            
            // Get the timer border location to help us with positioning and text scaling
            var timerBorder = game.scene.gameBorders.getChildAt(2);
            
            var desiredSize = Math.round(timerBorder.height * 0.7);
            var newScale = (desiredSize / this.defaultTextSize) / 2;
            
            this.textScale = newScale;
            textWidth = this.text.getBounds().width / App.deviceScale();
            textHeight = this.text.getBounds().height / App.deviceScale();
            
            // Position the textbox to be centre
            this.location.x = timerBorder.position.x + (timerBorder.width / 2) - (textWidth / 2);
            this.location.y = timerBorder.position.y + (timerBorder.height / 2) - (textHeight / 1.25);
            
            
            // Show
            this.display();
        },
        
        display: function(){

            // Set position
            this.text.position.set(this.location.x, this.location.y);

            // Set scale
            this.text.scale.set(this.textScale,this.textScale);
        },
        
        timeFormat: function(totalSecs){
            
            var timeMin, timeSec, formatMin, formatSec;
            
            timeMin = Math.floor(totalSecs / 60);
            timeSec = Math.floor(totalSecs - (timeMin * 60));
            //timeSec = (totalSecs - (timeMin * 60)).toFixed(2);
            
            formatMin = timeMin.toString();
            if (timeMin < 10) {
                formatMin = "0" + formatMin;
            }
            
            formatSec = timeSec.toString();
            if (timeSec < 10) {
                formatSec = "0" + formatSec;
            }
            
            var combinedFormat = "00:" + formatMin + ":" + formatSec;
            
            return combinedFormat;
        }
    });
});