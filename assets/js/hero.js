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

Hero.prototype.jumpSpeed = 400;

Hero.prototype.chargeJump = function() {
	const JUMP_LIMIT = 800,
		JUMP_INCREASE = 10;
	if (this.jumpSpeed < JUMP_LIMIT) {
		this.jumpSpeed += JUMP_INCREASE;
	}
};

Hero.prototype.jump = function() {
	const JUMP_MIN = 400;
	let canJump = this.body.onFloor();
	if (canJump) {
		this.body.velocity.y = - this.jumpSpeed;
		this.animations.play('jump');
	}

	this.jumpSpeed = JUMP_MIN;

	return canJump;
};

Hero.prototype.hover = function() {
	const HOVER_SPEED = 100, LIMIT = 400;

	if (this.body.velocity.y > -LIMIT)
		this.body.velocity.y += -HOVER_SPEED; 
};
