var RolePlayGame = RolePlayGame || {};

RolePlayGame.Preload = function() {};

RolePlayGame.Preload.prototype = {
	preload: function() {
		/*
		 * Show loading screen
		 */
		this.game.load.image('background', 'assets/images/background.png');
		this.game.load.image('build1', 'assets/images/Buildings.png');
		this.game.load.image('build2', 'assets/images/Buildings_1.png');
		this.game.load.image('ground1', 'assets/images/Ground.png');
		this.game.load.tilemap('level:1', 'assets/tilemaps/Level_city2.json', 
			null, Phaser.Tilemap.TILED_JSON);
		this.game.load.spritesheet('hero', 'assets/images/player1.png', 80, 110, 24);
	},
	
	create: function() {
		this.state.start('Play');
	}
};
