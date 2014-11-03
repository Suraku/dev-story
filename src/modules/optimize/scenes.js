game.module(
    'modules.optimize.scenes'
)
.require(
    'engine.scene'
)
.body(function() {

    App.Optimize.Intro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            // List of Levels
            App.LevelList = App.getLevelList();
            
            // Get level
            this.level = game.storage.get("CurrentLevel");
            
            var assets = 0;

            // Aquire generic assets
            assets += App.requireAsset("Roboto-export.png");
            assets += App.requireAsset("Roboto-export.fnt");
            assets += App.requireAsset("pause.png");
            assets += App.requireAsset("pause_sound.png");
            assets += App.requireAsset("pause_vibrate.png");
            assets += App.requireAsset("pause_quit.png");
            assets += App.requireAsset("pause_resume.png");

            // Aquire game assets
            assets += App.requireAsset("optimize/icon.png");
            assets += App.requireAsset("optimize/optimize_intro_1.png");
            assets += App.requireAsset("optimize/puzzleBorder.png");
			assets += App.requireAsset("optimize/timerBorder.png");
            assets += App.requireAsset("optimize/shape.png");
            
            // Puzzle assets.
            // Note below images from PixaBay are both licensed under CC0 Public Domain (https://creativecommons.org/publicdomain/zero/1.0/deed.en)
            assets += App.requireAsset("optimize/helloWorld.png");
            assets += App.requireAsset("optimize/codeSamplePuzzle.png");
            assets += App.requireAsset("optimize/pixabay_puzzle_world.png");         // Source: http://pixabay.com/en/http-www-digital-computer-science-368146/
			assets += App.requireAsset("optimize/pixabay_puzzle_programmer.png");    // Source: http://pixabay.com/en/nine-to-five-job-work-station-155175/
            
            // Sound
            assets += App.requireSound("audio/concept_bg_level_01.wav", "concept_bg");

            // Colours
            switch (this.level) {

                //sequence is: spark, nucleus, cog, background
                case 0:
                    App.currentPalette = [0xf5c908, 0x52b6b0, 0xe59828, 0x394551];
                    break;
                case 1:
                    App.currentPalette = [0xfddc8a, 0x87c666, 0x37ced1, 0x2e5a39];
                    break;
                case 2:
                    App.currentPalette = [0xffde8b, 0xcb257d, 0xff8f57, 0x511844];
                    break;

            }

            // Set bg colour
            game.system.stage.setBackgroundColor(App.currentPalette[3]);

            // Container
            this.loading = new game.Container();
            this.loading.scale.set(App.deviceScale(), App.deviceScale());

            // If assets to load
            if(assets) {

                // Create loader
                this.loader = new game.Loader();

                // Set dynamic
                this.loader.dynamic = true;

                // Objects
                this.loadingText = new game.Text( "Loading...".toUpperCase(), { fill: "white", font: 'bold 72px sans-serif' } );
                this.loadingText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.loadingText.width / 2);
                this.loadingText.position.y = ((game.system.height / App.deviceScale()) / 2) - (this.loadingText.height / 2);
                this.bar = new game.Graphics();
                this.bar.beginFill(App.currentPalette[1]); 
                this.bar.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
                this.bar.position.y = 0;
                this.bar.position.x = -(game.system.width / App.deviceScale());
                this.bar.endFill();

                // Add items to sprite
                this.loading.addChild(this.bar);
                this.loading.addChild(this.loadingText);

                // Add item to stage
                this.stage.addChild(this.loading);

                // Start loading
                this.loader.start();

            } else {

                // Skip preloading
                this.loaded();

            }
        },

        loaded: function(){

            var text1, text2, text3, GameIntro;

            // Get level
            this.level = game.storage.get("CurrentLevel");

            // Analytics 
            App.sendPageView('Optimize Challenge - Level ' + (this.level+1));

            // Set intro text
            switch (this.level) {
                case 0:
                    text1 = "Flawless execution.";
                    text2 = "Improve code functionality by moving the code around to achieve optimal performance.";
                    text3 = "Solve the puzzle as fast as you can.";
                    break;
                case 1:
                    text1 = "How efficient can we make this?";
                    text2 = "Improve code functionality by moving the code around to achieve optimal performance.";
                    text3 = "Solve the puzzle as fast as you can.";
                    break;
                case 2:
                    text1 = "Perfection is hard yet rewardable.";
                    text2 = "Improve code functionality by moving the code around to achieve optimal performance.";
                    text3 = "Solve the puzzle as fast as you can.";
                    break;
            }

            // Create level object
            GameIntro = App.GameIntro.extend({
                icon: "media/optimize/icon.png",
                title: text1,
                text1: text2,
                text2: text3,
                img1: ["media/optimize/optimize_intro_1.png", 320, 80],
                img2: [""],
                link: App.Optimize.Game
            });

            // Create
            this.gameIntro = new GameIntro();

        },

        update: function(){

            this._super();

            // Check loader is available
            if(this.loader) {

                // Check loader started
                if(this.loader.started) {

                    // Move the bar
                    this.bar.position.x += (2500 * game.system.delta);

                    // Check bar is not overrun
                    if(this.bar.position.x > (-(game.system.width / App.deviceScale()) + ( (game.system.width / App.deviceScale()) / 100) * this.loader.percent)) {

                        // Reset bar position
                        this.bar.position.x = -(game.system.width / App.deviceScale()) + (((game.system.width / App.deviceScale()) / 100) * this.loader.percent);

                    }

                    // If bar is finished
                    if(this.bar.position.x >= 0) {

                        // Remove the loading screen
                        this.stage.removeChild(this.loading);

                        // Reset loader
                        this.loader.started = false;

                        // Fire callback
                        this.loaded();

                    }
                }
            }

        }
    });

    App.Optimize.Game = game.Scene.extend({

        backgroundColor: 0x3c495b,
        score: 0,
        clickCounter: 0,
        stopwatch: 0,
        difficulty: [
            ["e", 3],
            ["m", 4],
            ["h", 5]
        ],
		DISTANCE_FROM_EDGE: 0.10,		// Expressed as percentage
		RIGHT_SIDE_DISTANCE: 0.30,		// Expressed as percentage
		puzzleBorderThickness: 0.04,    // Percentage of original image prior to scaling, do not change.
        TIMER_BORDER_HEIGHT: 0.2,       // Percentage

        init: function(){

            // Set bg colour
            game.system.stage.setBackgroundColor(App.currentPalette[3]);

            // Get level
            this.level = game.storage.get("CurrentLevel") || 0;
            this.gridLines = 0;
            
            // Screenflash
            this.flash = new game.Graphics();
            this.flash.beginFill(0xFFFFFF);
            this.flash.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
            this.flash.endFill();
            this.flash.alpha = 0;

            // Setup the dimensions based on difficulty.
            if (this.level === 0) { this.gridLines = 3; }
            else if (this.level === 1) { this.gridLines = 4; }
            else { this.gridLines = 5; }

            // Start the music
            App.playMusic("concept_bg", 0.5);

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());
            
            
            // Puzzle pieces
            var puzzleTextureCollections = [
                //new game.PIXI.Texture.fromImage('media/optimize/helloWorld.png', 0, 0),
                new game.PIXI.Texture.fromImage('media/optimize/codeSamplePuzzle.png', 0, 0),
                new game.PIXI.Texture.fromImage('media/optimize/pixabay_puzzle_world.png', 0, 0),
                new game.PIXI.Texture.fromImage('media/optimize/pixabay_puzzle_programmer.png', 0, 0)
            ];
            
            this.puzzle_Original_Texture = puzzleTextureCollections[Math.randomInt(0, puzzleTextureCollections.length - 1)];
            this.puzzle_Original_Sprite = new game.PIXI.Sprite(this.puzzle_Original_Texture);
            
            
            this.scaledScreenWidth = game.system.width / App.deviceScale();
            this.scaledScreenHeight = game.system.height / App.deviceScale();
            
            var screen_Width = this.scaledScreenWidth;
            var screen_Height = this.scaledScreenHeight;
            
            // Define the grid distance from the edge of the screen for use in the creation of control and sprites.
            this.gridDistanceToEdge = Math.round(this.DISTANCE_FROM_EDGE * screen_Height);
            
			
			// ----- Begin background setup area -----
			//
            // Setup a template background to provide the tiles with a guideline area.
            var screenLength, isUsingWidth;
            if (screen_Height > screen_Width) {
                screenLength = screen_Width;
				isUsingWidth = true;
            } else {
                screenLength = screen_Height;
				isUsingWidth = false;
            }
            
			// Default to a maximum value if required to allow room the timer and completed image.
            var gridLength = Math.round((1 - (this.DISTANCE_FROM_EDGE * 2)) * screen_Width);     // Multiply distance percentage due to both sides.
			var maxGridWidth = Math.round((1 - this.RIGHT_SIDE_DISTANCE) * screenLength);
			if (gridLength > maxGridWidth) {
				gridLength = maxGridWidth;
                isUsingWidth = true;
			}
			
			// Check for reposition to ensure our grid is centre along the y-axis.
			this.y_gridBackgroundPosition = 0;
			if (isUsingWidth) {
				// Find the screen centre and thus the starting y-axis position
				this.y_gridBackgroundPosition = screen_Height * 0.5 - gridLength * 0.5;
			} else {
				this.y_gridBackgroundPosition = this.gridDistanceToEdge;
			}
			
            this.gridBackgroundArea = new game.Graphics();
            this.gridBackgroundArea.beginFill(0xffffff, 0);
            this.gridBackgroundArea.drawRect(this.gridDistanceToEdge, this.y_gridBackgroundPosition, gridLength, gridLength);
            this.gridBackgroundArea.endFill();
            
            this.gridBackgroundArea.setInteractive(true);
            this.gridBackgroundArea.hitArea = new game.PIXI.Rectangle(this.gridDistanceToEdge, this.y_gridBackgroundPosition, gridLength, gridLength);
            //
			// ----- end background area -----
			
			
            // Setup the container ready for the tiles to be added.
            this.puzzleContainer = new game.Container();
            
            // Initialize the puzzle.
            this.puzzleLayer = new App.Optimize.SplitImage();
            
            // Setup the click events for the tiles, after we have our puzzle initialized.
            this.gridBackgroundArea.tap = this.gridBackgroundArea.click = this.puzzleGridClick.bind(this);
            
            

            // Position the borders
            this.gameBorders = new game.Container();
			
			var puzzleBorderTexture = new game.PIXI.Texture.fromImage('media/optimize/puzzleBorder.png', 0, 0);
			var timerBorderTexture = new game.PIXI.Texture.fromImage('media/optimize/timerBorder.png', 0, 0);
                 
            
			// Main puzzle border
            var puzzleBorderSprite = new game.PIXI.Sprite(puzzleBorderTexture);
            var puzzleBorderLength = Math.max(gridLength * this.puzzleBorderThickness);
			puzzleBorderSprite.width = puzzleBorderSprite.height = gridLength + (puzzleBorderLength * 2);    // Take border percentage and add.
            puzzleBorderSprite.position.x = this.gridDistanceToEdge - puzzleBorderLength;
			puzzleBorderSprite.position.y = this.y_gridBackgroundPosition - puzzleBorderLength;
            this.gameBorders.addChild(puzzleBorderSprite);
            
            
			// Completed puzzle preview border
			var previewBorderSprite = new game.PIXI.Sprite(puzzleBorderTexture);
			var previewBorderSize = Math.max(screen_Width - (3 * this.gridDistanceToEdge) - this.gridBackgroundArea.width) + (2 * puzzleBorderLength);
            
            // Need a maximum size set for long devices.
            var maxCompletedSpriteSize = Math.round(screen_Width * (this.RIGHT_SIDE_DISTANCE - 0.03));
            if (previewBorderSize > maxCompletedSpriteSize) { 
                previewBorderSize = maxCompletedSpriteSize; 
            }
            
            var previewBorderLength = Math.max(previewBorderSize * this.puzzleBorderThickness);
			previewBorderSprite.position.x = (2 * (this.gridDistanceToEdge)) + this.gridBackgroundArea.width - puzzleBorderLength;
			previewBorderSprite.position.y = screen_Height - puzzleBorderSprite.position.y - previewBorderSize;
			previewBorderSprite.width = previewBorderSprite.height = previewBorderSize;
			this.gameBorders.addChild(previewBorderSprite);
            
            
			// Timer border
			var timerBorderSprite = new game.PIXI.Sprite(timerBorderTexture);
            timerBorderSprite.width = previewBorderSize;
            timerBorderSprite.height = Math.round(screen_Height * this.TIMER_BORDER_HEIGHT);
            var maxTimerBorderHeight = Math.round(screen_Height - (3 * puzzleBorderSprite.position.x) - previewBorderSize);
            if (timerBorderSprite.height > maxTimerBorderHeight) {
                timerBorderSprite.height = maxTimerBorderHeight;
            }
            timerBorderSprite.position.x = previewBorderSprite.position.x;
            timerBorderSprite.position.y = (maxTimerBorderHeight / 2) - (timerBorderSprite.height / 2) + puzzleBorderSprite.position.x;
            this.gameBorders.addChild(timerBorderSprite);
			
			
            // Add the completed puzzle using its border as guideline.
            var completedPuzzleSprite = new game.PIXI.Sprite(this.puzzle_Original_Texture);
            completedPuzzleSprite.width = completedPuzzleSprite.height = previewBorderSprite.width - (2 * previewBorderLength);
            completedPuzzleSprite.position.x = previewBorderSprite.position.x + previewBorderLength;
            completedPuzzleSprite.position.y = previewBorderSprite.position.y + previewBorderLength;
            
            
            // -----------------------------
            
            // Text box
            this.textBox = new game.Text("Text Box!", { fill: "white", font: 'bold 64px sans-serif' } );
            this.textBox.position.y = 64;
            this.textBox.alpha = 0;

            // Speed difficulty
            this.speed = 100 + ((this.level+1) * 100);
            
            // -----------------------------
            

            // Create container
            this.codeLayer = new game.Container();
            this.container.addChild(this.gridBackgroundArea);
            this.container.addChild(this.puzzleContainer);
            this.container.addChild(completedPuzzleSprite);
			this.container.addChild(this.gameBorders);
            this.container.addChild(this.textBox);


            this.deltaMultiplier = 1;
            
            // Create the timer
            this.puzzleTimer = new App.Optimize.PuzzleTimer();

            // Pause
            this.pauseButton = new App.Pause.PauseButton();

            this.stage.addChild(this.container);
        },

        update: function() {

            if(App.developer) {
                App.stats.begin();
            }


            if(!App.paused) {

                // Add to time index
                this.timeIndex += game.system.delta;
                
                this._super();
                
            }

            if(App.developer) {
                App.stats.end();
            }

        },
        
        puzzleGridClick: function(clickedTile) {
            
			// Get the grid containing all the _indexed_ tiles.
            var corePuzzleGrid = this.puzzleLayer.indexedSlicedSprites;

            var selectedTileWithIndex, blankTileWithIndex, selectedArrayPosition, blankArrayPosition;
            
            // Search through each tile until we find the correct tile which was selected.
            for (i = 0; i < corePuzzleGrid.length; i++) {
                for (j = 0; j < corePuzzleGrid.length; j++) {
                    var spriteAndIndex = corePuzzleGrid[i][j];
                    var sprite = spriteAndIndex[1];
                    
                    // Draw a graphic from the sprite, and see if our mouse co-ordinates match it
                    var rectangle = new game.PIXI.Rectangle(sprite.position.x, sprite.position.y, sprite.width, sprite.height);
                    
                    // Scale the clicked location to match our scaled objects.
                    var clickedTile_x = clickedTile.swipeX / App.deviceScale();
                    var clickedTile_y = clickedTile.swipeY / App.deviceScale();
                    
                    // Find the blank tile and the selected tiles
                    if (rectangle.contains(clickedTile_x, clickedTile_y)) {
                        selectedTileWithIndex = spriteAndIndex;
                        selectedTilePosition = (i * corePuzzleGrid.length) + j;
                        var wub = selectedTilePosition;
                    }
                    if (corePuzzleGrid[i][j][0] == (corePuzzleGrid.length * corePuzzleGrid.length) - 1) {
                        blankTileWithIndex = spriteAndIndex;   
                        blankArrayPosition = (i * corePuzzleGrid.length) + j;
                    }
                }
                // Stop looping once we have found both for efficiency.
                if (selectedTileWithIndex !== undefined && blankTileWithIndex !== undefined) {
                    break;
                }
            }
            
            if (selectedTileWithIndex === undefined || blankTileWithIndex === undefined) {
                return;
            }
            
            // Finding the distance between tiles.
            var tileDistanceApart = corePuzzleGrid[0][1][1].position.x - corePuzzleGrid[0][0][1].position.x;
            
            // Check they aren't the same tile:
			if (selectedTileWithIndex[1].position.x === blankTileWithIndex[1].position.x && selectedTileWithIndex[1].position.y === blankTileWithIndex[1].position.y) {
                return;
            }
            
            // Using both tiles, check if we qualify for swapping them.
            var selectedTile = selectedTileWithIndex[1];
            var blankTile = blankTileWithIndex[1];
			
            
			// Check if we are in range of empty tile.
			if (selectedTile.position.y + tileDistanceApart === blankTile.position.y || selectedTile.position.y - tileDistanceApart === blankTile.position.y) {
                if (selectedTile.position.x === blankTile.position.x) {
                    this.clickCounter += 1;
                    game.scene.moveTile(selectedTileWithIndex, blankTileWithIndex, selectedTilePosition, blankArrayPosition);
                }
            }
            
            if (selectedTile.position.x + tileDistanceApart === blankTile.position.x || selectedTile.position.x - tileDistanceApart === blankTile.position.x) {
                if (selectedTile.position.y === blankTile.position.y) {
                    this.clickCounter += 1;
                    game.scene.moveTile(selectedTileWithIndex, blankTileWithIndex, selectedTilePosition, blankArrayPosition);
                }
			}
			
			/* Do nothing if reached. */
        },
        
        moveTile: function(selectedTileIndexed, blankTileIndexed, selectedArrayPosition, blankArrayPosition) {
            
            // Get the image grid and the tiles.
            var puzzleGrid = this.puzzleContainer;
			var selectedTile = puzzleGrid.getChildAt(selectedArrayPosition);
            var blankTile = puzzleGrid.getChildAt(blankArrayPosition);
            var gridLines = game.scene.gridLines;
			
			// Swap the tiles
            if (!game.scene.ended && !game.scene.pauseObjects && !App.paused) {
                
                // Update the X-axis if required.
                //
                var x_directionToMove = 1;    // +1 to the right
                var x_originalPosition = selectedTile.position.x;
                
                // Check the direction we should move in
                if (selectedTile.position.x > blankTile.position.x) {
                    x_directionToMove = -1;   // -1 to the left
                }

                while (selectedTile.position.x != blankTile.position.x) {
                    puzzleGrid.getChildAt(selectedArrayPosition).position.x += x_directionToMove;
                }
                puzzleGrid.getChildAt(blankArrayPosition).position.x = x_originalPosition;
                
                
                // Update the Y-axis if required.
                //
                var y_directionToMove = 1;
                var y_originalPosition = selectedTile.position.y;
                
                // Check the direction we should move in
                if (selectedTile.position.y > blankTile.position.y) {
                    y_directionToMove = -1;   // -1 to the left
                }
                
                while (selectedTile.position.y != blankTile.position.y) {
                    puzzleGrid.getChildAt(selectedArrayPosition).position.y += y_directionToMove;
                }
                puzzleGrid.getChildAt(blankArrayPosition).position.y = y_originalPosition;
                
                
                // Now swap the tiles within the arrays to reflect the above location changes.
                puzzleGrid.swapChildren(puzzleGrid.getChildAt(selectedArrayPosition), puzzleGrid.getChildAt(blankArrayPosition));
                
                
                // Make sure we also update the indexed row array too, as that's used in the processing of click events.
                var currentIndexedArray = this.puzzleLayer.indexedSlicedSprites;
                var joinedIndexArray = [];
                for (i = 0; i < currentIndexedArray.length; i++) {
                    for (j = 0; j < currentIndexedArray.length; j++) {
                        joinedIndexArray.push(currentIndexedArray[i][j]);
                    }
                }
                var oldSelectedPosition = joinedIndexArray[selectedArrayPosition];
                joinedIndexArray[selectedArrayPosition] = joinedIndexArray[blankArrayPosition];
                joinedIndexArray[blankArrayPosition] = oldSelectedPosition;

                // Now slice back up into the correct grid-format array.
                var slicedNewIndexedArray = [];
                for (i = 0; i < gridLines; i++) {
                    var slicedArray = joinedIndexArray.slice((i * gridLines), ((i + 1) * gridLines));
                    slicedNewIndexedArray.push(slicedArray);
                }
                
                this.puzzleLayer.indexedSlicedSprites = slicedNewIndexedArray;
                
                
                // Check if we have completed the puzzle
                game.scene.checkComplete(this.puzzleLayer.indexedSlicedSprites);
            }
        },
        
        
        checkComplete: function(indexedTiles){
            
            // Loop through finding any incorrect index placements
            for (i = 0; i < indexedTiles.length; i++) {
                for (j = 0; j < indexedTiles.length; j++) {
                    var tilePosition = indexedTiles[i][j][0];
                    var expectedIndex = (i * indexedTiles.length) + j;
                    if (tilePosition !== expectedIndex) {
                        return;
                    }
                }
            }
            // Reaching here means we are complete!
            game.scene.endGame();
        },

        endGame: function(){

            var self = this, flashTween;

            // Set the game ended flag
            this.ended = true;

            // If the game is in debug mode
            if(this.pauseObjects) {

                // Leave debug mode
                this.leaveBugsMode();
            }
            
            // Get the time we finished at
            var timeTakenToFinish = Math.ceil(this.stopwatch);
            var clicksTakenToFinish = this.clickCounter;
            
            var platinumReward = 10, goldReward = 20, silverReward = 30, bronzeAward = 40;
            
            var scoringMultiplier = Math.floor((this.gridLines * this.gridLines) / 3);
            
            if (timeTakenToFinish <= (scoringMultiplier * platinumReward)) {
                this.score = 100;
            } else if (timeTakenToFinish <= (scoringMultiplier * goldReward) && timeTakenToFinish > (scoringMultiplier * platinumReward)) {
                this.score = 75;
            } else if (timeTakenToFinish <= (scoringMultiplier * silverReward) && timeTakenToFinish > (scoringMultiplier * goldReward)) {
                this.score = 50;
            } else if (timeTakenToFinish <= (scoringMultiplier * bronzeAward) && timeTakenToFinish > (scoringMultiplier * silverReward)) {
                this.score = 25;
            } else {
                this.score = 0;
            }
            
            // Set the final score
            this.finalScore = this.score;

            // Create the flash tween
            flashTween = new game.Tween(this.flash);
            flashTween.to({ alpha: 1 }, 1000);
            flashTween.start();
            flashTween.onComplete(function(){
                game.storage.set("game_4_score", Math.min(self.finalScore, 100));
                game.system.setScene(App.Optimize.Outro);
            });

        }
    });

    App.Optimize.Outro = game.Scene.extend({

        backgroundColor: 0x3c495b,

        init: function(){

            // Get/Set app name
            if(!game.storage.get("CurrentAppName")) {
                game.storage.set("CurrentAppName", App.generateName());
            }

            // Get score
            this.score = Math.floor(game.storage.get("game_4_score")) || 0;

            // Create level object
            var GameOutro = App.GameOutro.extend({ 

                icon: "media/optimize/icon.png",
                title: "You built",
                shape: "media/optimize/shape.png",
                score: this.score + "%"

            });

            // Create
            this.gameOutro = new GameOutro();
            
        }

    });

});
