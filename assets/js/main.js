PlayState = {};

PlayState.init = function() {
	this.game.renderer.renderSession.roundPixels = true;

	this.keys = this.game.input.keyboard.addKeys({
		left: Phaser.KeyCode.A,
		right: Phaser.KeyCode.D,
		up: Phaser.KeyCode.W,
		jump: Phaser.KeyCode.SPACEBAR,
		weapon: Phaser.KeyCode.F
	});

	this.keys.jump.onUp.add(function() {
		this.hero.jump();
	}, this);
};

PlayState.preload = function() {
	this.game.load.image('background', 'assets/images/background.png');
	this.game.load.image('build1', 'assets/images/Buildings.png');
	this.game.load.image('build2', 'assets/images/Buildings_1.png');
	this.game.load.image('ground1', 'assets/images/Ground.png');
	this.game.load.tilemap('level:1', 'assets/tilemaps/Level_city2.json', 
		null, Phaser.Tilemap.TILED_JSON);
	this.game.load.spritesheet('hero', 'assets/images/player1.png', 80, 110, 24);
};

PlayState.create = function() {
	background = this.game.add.image(0, 0, 'background');
	background.fixedToCamera = true;

	this._loadLevel();
};

PlayState.update = function() {
	this._handleCollisions();
	this._handleInput();
};

PlayState._loadLevel = function(data) {
	const GRAVITY = 1000;
	this.game.physics.arcade.gravity.y = GRAVITY;

	this.map = this.game.add.tilemap('level:1');	
	this.map.addTilesetImage('Buildings', 'build1');
	this.map.addTilesetImage('Buildings_1', 'build2');
	this.map.addTilesetImage('Ground', 'ground1');
	
	this.platformLayer = this.map.createLayer('Platforms');
	this.groundLayer = this.map.createLayer('Ground');
	this.buildingLayer = this.map.createLayer('Buildings');
	this.decorationLayer = this.map.createLayer('Decoration');
	this.map.setCollisionBetween(1, 2000, true, 'Ground');
	this.map.setCollisionBetween(1, 2000, true, 'Platforms');
	this.groundLayer.resizeWorld();

	this._spawnCharacters();
	this._createDoors();
};

PlayState._spawnCharacters = function(data) {
	this.hero = new Hero(this.game, 500, 900);
	this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function(platform) {
	let sprite = this.platforms.create(platform.x, platform.y, platform.image);	
	this.game.physics.enable(sprite);
	sprite.body.allowGravity = false;
	sprite.body.immovable = true;
};

PlayState._handleCollisions = function() {
	this.game.physics.arcade.collide(this.hero, this.groundLayer);
	this.game.physics.arcade.collide(this.hero, this.platformLayer);
};

PlayState._handleInput = function() {
	// Move
	if (this.keys.left.isDown)
		this.hero.move(-1);
	else if (this.keys.right.isDown) 
		this.hero.move(1);
	else
		this.hero.move(0);
	
	// Charge Jump
	if (this.keys.jump.isDown)
		this.hero.chargeJump();

	// Hover
	if (this.keys.up.isDown) 
		this.hero.hover();

	// Show weapon
	if (this.keys.weapon.isDown)
		this.hero.animations.play('weapon');
};

PlayState._spawnItems = function() {
	this._spawnDoors();	
};

PlayState._spawnDoors = function() {
	this.doors = this.game.add.group();
	this.doors.enableBody = true;
	this.doors.body.allowGravity = false;
	this.doors.body.immovable = true;

	var result = this._findObjectsByType('doors', this.map, 'Doors');
	result.ForEach(function(element){
		this._createFromTiledObject(element, this.doors);
	}, this);
};

PlayState._findObjectsByType = function(type, map, layer) {
	var result = new Array();
	map.objects[layer].forEach(function(element){
		if (element.properties.type === type) {
			element.y -= map.tileHeight;
			result.push(element);
		}
	});
	return result;
};

PlayState._createFromTiledObject = function(element, group) {
	var sprite = group.create(element.x, element.y, element.properties.sprite)

	Object.keys(element.properties).forEach(function(key){
		sprite[key] = element.properties[key];
	});
};


window.onload = function() {
	var game = new Phaser.Game(1024, 720, Phaser.AUTO, 'game');
	game.state.add('play', PlayState);
	game.state.start('play');
};

