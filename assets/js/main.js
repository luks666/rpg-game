function Hero(game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'hero');
	this.anchor.set(0.5);
	this.game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.game.camera.follow(this);

	this.animations.add('idle', [0]);
	this.animations.add('walk', [9, 10], 8, true);
	this.animations.add('jump', [1]);
    this.animations.add('fall', [2]);
	this.animations.add('duck', [3]);
	this.animations.add('sneak', [19,3], 8, true);
	this.animations.add('weapon', [11]);
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function(direction) {
	const SPEED = 600;
	this.body.velocity.x = direction * SPEED;
	
	if (direction < 0)
		this.scale.x = -1;
	else
		this.scale.x = 1;
	
	if (this.body.onFloor()) {
		if (this.body.velocity.x === 0)
			this.animations.play('idle');
		else 
			this.animations.play('walk');
	}
	else {
		if (this.body.velocity.y <= 0 )
			this.animations.play('jump');
		else
			this.animations.play('fall');
	}
};

Hero.prototype.animate = function() {
	if (this.body.onFloor()) {
		if (this.body.velocity.x === 0)
			this.animations.play('idle');
		else
			this.animations.play('walk');
	}
	else if (this.body.velocity.y < 0) {
		this.animations.play('jump');
	}
	else {
		this.animations.play('fall');
	}
};

Hero.prototype.jump = function() {
	const JUMP_SPEED = 800;
	
	//let canJump = this.body.touching.down;
	let canJump = this.body.onFloor();
	if (canJump) {
		this.body.velocity.y = - JUMP_SPEED;
		this.animations.play('jump');
	}

	return canJump;
};

Hero.prototype.hover = function() {
	const HOVER_SPEED = 100, LIMIT = 400;

	if (this.body.velocity.y > -LIMIT)
		this.body.velocity.y += -HOVER_SPEED; 
};

PlayState = {};

PlayState.init = function() {
	this.game.renderer.renderSession.roundPixels = true;

	this.keys = this.game.input.keyboard.addKeys({
		left: Phaser.KeyCode.A,
		right: Phaser.KeyCode.D,
		up: Phaser.KeyCode.W,
		jump: Phaser.KeyCode.SPACEBAR,
		sword: Phaser.KeyCode.F
	});

	this.keys.jump.onDown.add(function() {
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
	const GRAVITY = 2000;
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
	// Hover
	if (this.keys.up.isDown) 
		this.hero.hover();
	// Show sword
	if (this.keys.sword.isDown)
		this.hero.animations.play('weapon');
};

PlayState._spawnItems = function() {
	
	this.doors = this.game.add.group();
	this.doors.enableBody = true;
	
	var doors;
	result = this._findObjectsByType('doors', this.map, 'Doors');
	result.forEach(function(element) {
		this._createFromTiledObject(element, this.doors);
	}, this);
	
};

PlayState._findObjectsByType = function(type, map, layer) {
	var result = new Array();
	map.objects[layer].forEach(function(element){
		if(element.properties.type === type) {
			
			element.y -= map.tileHeight;
			result.push(element);
		}
	});
};


PlayState._createFromTiledObject = function(element, group) {
	var sprite = group.create(element.x, element.y, element.properties.sprite)

	Object.keys(element.properties).forEach(function(key){
	sprite[key] = element.properties[key];
	});
};



PlayState._createDoors = function() {
	//create doors
	this.doors = this.game.add.group();
	this.doors.enableBody = true;
	result = this._findObjectsByType('doors', this.map, 'Doors');
	
	result.ForEach(function(element){
		this._createFromTiledObject(element, this.doors);
	}, this);

	
};




window.onload = function() {
	var game = new Phaser.Game(1024, 720, Phaser.AUTO, 'game');
	game.state.add('play', PlayState);
	game.state.start('play');
};

/*
function create () {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.gravity.y = 250;

	// Player
	player = game.add.sprite(100, 600, 'player');
	game.physics.enable(player, Phaser.Physics.ARCADE);
	
	player.anchor.set(0.5, 1);
	player.body.collideWorldBounds = true;
	player.body.gravity.y = 1500;
	
	player.facing = 'right';
	player.jumpPower = 1200;
	player.moveSpeed = 300;
	player.hoverPower = 100;
	player.hoverSpeed = 400;

	player.animations.add('walk', [9, 10], 8, true);
	player.animations.add('idle', [0]);
	player.animations.add('jump', [1]);
    player.animations.add('fall', [2]);
	player.animations.add('duck', [3]);
	player.animations.add('sneak', [19,3], 8, true);
	player.animations.add('weapon', [11]);
	
	game.camera.follow(player);

	// Input keys
	cursors = game.input.keyboard.createCursorKeys();
	moveKeys = {
		up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D)
	};
	key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
	key2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
	hoverKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	player.move = function() {
		if (cursors.left.isDown || moveKeys.left.isDown) {
			this.body.velocity.x = -this.moveSpeed;
			this.scale.x = -1;
			this.animations.play('walk');
			this.facing = 'left';		
		}
		else if (cursors.right.isDown || moveKeys.right.isDown) {
			this.body.velocity.x = this.moveSpeed;
			this.scale.x = 1;
			this.animations.play('walk');
			this.facing = 'right';
		}	
		else {
			this.body.velocity.x = 0;
			if (key1.isDown)
				this.animations.play('weapon');
			else
				this.animations.play('idle');
			this.animations.stop();
			
			if (this.facing == 'left')
				this.scale.x = -1;
		}
		
		// Jump	
		if (cursors.up.isDown || moveKeys.up.isDown) {
			if (this.body.onFloor())
				this.body.velocity.y = -this.jumpPower;
		}
		if (this.body.velocity.y < 0) 
			this.animations.play('jump');		
		else if (this.body.velocity.y > 0 && !this.body.onFloor()) 
			this.animations.play ('fall');

		// Hover
		if (hoverKey.isDown) {
			this.body.velocity.y += -this.hoverPower;
			if (this.body.velocity.y < -this.hoverSpeed)
				this.body.velocity.y = -this.hoverSpeed;
		}
		
		// sneak, duck	
		if (cursors.down.isDown || moveKeys.down.isDown) {
			if (this.body.velocity.x != 0)
				this.animations.play('sneak');	
			else	
				this.animations.play ('duck');
		}
	};

	player.update = function() {
		game.physics.arcade.collide(this, layer);
		player.move();
	};	

};

function update () {
	player.update();
};

function render () {

};
*/



