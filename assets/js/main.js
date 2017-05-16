var RolePlayGame = RolePlayGame || {};

RolePlayGame.game = new Phaser.Game(1024, 720, Phaser.AUTO, 'game');

RolePlayGame.game.state.add('Boot', RolePlayGame.Boot);
RolePlayGame.game.state.add('Preload', RolePlayGame.Preload);
RolePlayGame.game.state.add('Play', RolePlayGame.Play);

RolePlayGame.game.state.start('Boot');

