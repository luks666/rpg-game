var RolePlayGame = RolePlayGame || {};

RolePlayGame.Boot = function() {};

RolePlayGame.Boot.prototype = {
	preload: function() {
		// load assets for loading screen
	},
	
	create: function() {
		this.game.stage.backgroundColor = "#fff";

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.state.start('Preload');
	}
};
