// AppleJS - a spinoff of a Mozilla Workshop platformer game. I have no idea what
// doing.


// =============================================================================
// Sprites
// =============================================================================

//
//Apple Sprite
//
function hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');  // call Phaser.Sprite constructor
    this.anchor.set(0.5, 0.5); //Adjust center of character
    this.game.physics.enable(this); // Use Phaser physics engine
    this.body.collideWorldBounds = true; //Enable bounds on character
}

// Inherit from Phaser.Sprite
hero.prototype = Object.create(Phaser.Sprite.prototype);
hero.prototype.constructor = hero;

hero.prototype.move = function (direction) {
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;
};

hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down;

    if(canJump){
        this.body.velocity.y = -JUMP_SPEED;
    }
    return canJump;
};

// =============================================================================
// Game States
// =============================================================================

PlayState = {};

// Preload game assets
PlayState.preload = function(){

    //Levels
    this.game.load.json('level:1', 'data/level01.json');
    
    //Images
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('hero', 'images/hero_stopped.png');

    //Sounds
    this.game.load.audio('sfx:jump', 'audio/jump.wav');
}

// Create entities and world setup
PlayState.create = function(){
    this.game.add.image(0, 0, 'background');
    this.loadLevel(this.game.cache.getJSON('level:1'));

    // Create sound entities
    this.sfx = {jump: this.game.add.audio('sfx:jump')};
}

//Initialize keyboard listeners
PlayState.init = function(){
    this.game.renderer.renderSession.roundPixels = true;

    //Bind keys to Phaser KeyCod
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.SPACEBAR
    })

    //Add listener to allow jump
    this.keys.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);
}

//Load all entities for level
PlayState.loadLevel = function(data){

    // Create a group for this game so that Phaser knows what's together
    this.platforms = this.game.add.group();

    data.platforms.forEach(this.spawnPlatform, this) //Call spawn for each data item in JSON
    this.spawnCharacters({hero: data.hero}); //Characters

    // Enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
}

//Spawns the platforms
PlayState.spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite); //Enable physics for all platforms
    sprite.body.allowGravity = false; //But disable gravity, so they don't fall
    sprite.body.immovable = true; //And set immovable so character doesn't push platform
};

//Spawns the Characters
PlayState.spawnCharacters = function (data) {
    // Hero
    this.hero = new hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

//Handle state updates
PlayState.update = function(){
    this.handleCollisions();
    this.handleInput();
}

//Handle user inputs
PlayState.handleInput = function(){
    if(this.keys.left.isDown){
        this.hero.move(-1);
    }else if(this.keys.right.isDown){
        this.hero.move(1);
    }else {
        this.hero.move(0);
    }
}



//Handle collosions
PlayState.handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
};

// =============================================================================
// entry point
// =============================================================================

// On window load for HTML
window.onload = function(){
    let game = new Phaser.Game(960, 600, Phaser.Auto, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
}