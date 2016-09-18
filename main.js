var game;

var menuState = {
    preload: function() {
        game.load.image('menu', 'assets/menu.png');
    },

    create: function() {
        var bg = game.add.sprite(0, 0, 'menu');
        bg.width = game.world.width;
        bg.height = game.world.height;

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
        game.load.image('block', 'assets/block.jpg');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.setBounds(0, 0, game.world.width, game.world.height + 100);

        this.ball = game.add.sprite(game.world.centerX, game.world.centerY, 'block');
        game.physics.arcade.enable(this.ball);
        this.ball.body.collideWorldBounds = true;
        this.ball.body.velocity.x = 200;
        this.ball.body.velocity.y = 200;
        this.ball.body.bounce.setTo(1, 1);

        this.paddle = game.add.sprite(game.world.centerX, game.world.height - 40, 'block');
        this.paddle.width = 200;
        this.paddle.height = 32;
        game.physics.arcade.enable(this.paddle);
        this.paddle.body.immovable = true;
        this.paddle.body.bounce.setTo(1, 1);
    },

    update: function() {
        this.paddle.body.position.x = game.math.clamp(game.input.x - this.paddle.width / 2, 0, game.world.width - this.paddle.width);

        game.physics.arcade.collide(this.paddle, this.ball);

        if (this.ball.body.position.y > game.world.height + this.ball.height) {
            game.state.start('main');
        }
    }
};

game = new Phaser.Game(1200, 800, Phaser.AUTO, '', null, false, false);

game.state.add('menu', menuState);
game.state.add('main', mainState);
game.state.start('menu');
