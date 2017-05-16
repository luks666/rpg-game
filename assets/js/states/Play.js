var RolePlayGame = RolePlayGame || {};
RolePlayGame.Play = function() {};

RolePlayGame.Play.prototype = {
	init: function() {
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
	},

	create: function() {
		var background = this.game.add.image(0, 0, 'background');
		background.fixedToCamera = true;

		this.loadLevel();
	},

	update: function() {
		this.handleCollisions();
		this.handleInput();
	},

	loadLevel: function(data) {
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

		this.spawnCharacters();
		this.spawnItems();
	},

	spawnCharacters: function(data) {
		let heroPosition = this.findObjectsByType('playerStart', this.map, 'Objects');
		this.hero = new Hero(this.game, heroPosition[0].x, heroPosition[0].y);
		this.game.add.existing(this.hero);
	},

	handleCollisions: function() {
		this.game.physics.arcade.collide(this.hero, this.groundLayer);
		this.game.physics.arcade.collide(this.hero, this.platformLayer);
	},

	handleInput: function() {
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
	},

	spawnItems: function() {
		this.spawnDoors();	
	},

	spawnDoors: function() {
		this.doors = this.game.add.group();
		this.doors.enableBody = true;
		this.doors.allowGravity = false;
		this.doors.immovable = true;	

		var result = this.findObjectsByType('door', this.map, 'Objects');
		result.forEach(function(element) {
			this.createFromTiledObject(element, this.doors);
		}, this);

	},

	spawnBoxes: function() {
		this.boxes = this.game.add.group();
		this.boxes.enableBody = true;
		this.boxes.allowGravity = false;
		this.boxes.immovable = true;

		var result = this.findObjectsByType('box', this.map, 'Objects');
		result.forEach(function(element) {
			this.createFromTiledObject(element, this.boxes);
		}, this);
	},

	findObjectsByType: function(type, map, layer) {
		var result = new Array();
		map.objects[layer].forEach(function(element){
			if (element.properties.type === type) {
				element.y -= map.tileHeight;
				result.push(element);
			}
		});

		return result;
	},

	createFromTiledObject: function(element, group) {
		var sprite = group.create(element.x, element.y, element.properties.sprite)

		Object.keys(element.properties).forEach(function(key){
			sprite[key] = element.properties[key];
		});
	}
};
