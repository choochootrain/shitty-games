var width = 1200;
var height = 800;

var game;

var menuState = {
    preload: function() {
        game.load.image('menu', 'assets/menu.png');
    },

    create: function() {
        var bg = game.add.sprite(0, 0, 'menu');
        bg.width = width;
        bg.height = height;

        game.input.mouse.capture = true;
    },

    update: function() {
        if (game.input.activePointer.leftButton.isDown) {
            game.state.start('main');
        }
    }
}

var mainState = {
    preload: function() {
        game.load.image('ball', 'assets/ball.jpg');
    },

    create: function() {
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.ball = game.add.sprite(100, 100, 'ball');
        game.physics.arcade.enable(this.ball);
        this.ball.body.collideWorldBounds = true;
        this.ball.body.velocity.x = 100;
        this.ball.body.velocity.y = 100;
        this.ball.body.bounce.setTo(1, 1);
    },

    update: function() {
        if (this.spaceKey.isDown) {
            this.ball.body.x = 10;
        }
    }
};

game = new Phaser.Game(width, height, Phaser.AUTO, '', null, false, false);

game.state.add('menu', menuState);
game.state.add('main', mainState);
game.state.start('menu');
