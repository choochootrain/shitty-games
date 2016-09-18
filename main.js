var width = 1200;
var height = 800;

var game;

var mainState = {
    preload: function() {
        game.load.image('ball', 'assets/ball.jpg');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.ball = game.add.sprite(100, 100, 'ball');
        game.physics.arcade.enable(this.ball);
        this.ball.body.collideWorldBounds = true;
        this.ball.body.velocity.x = 100;
        this.ball.body.velocity.y = 100;
        this.ball.body.bounce.setTo(1, 1);
    },

    update: function() {
    }
};

game = new Phaser.Game(width, height, Phaser.AUTO, '');
game.state.add('main', mainState);
game.state.start('main');
