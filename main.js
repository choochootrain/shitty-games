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

        this.blocks = game.add.group();
        var numRows = 5;
        var maxBlockRowSize = 6;
        var blockHeight = 64;
        var blockMargin = 10;
        for (var i = 0; i < numRows; i++) {
            var y = i * (blockHeight + blockMargin) + blockMargin;
            var rowSize = i % 2 === 1 ? maxBlockRowSize - 1 : maxBlockRowSize;

            var blockWidth = (game.world.width - (maxBlockRowSize + 1) * blockMargin) / maxBlockRowSize;

            var rowOffset = (i % 2 === 1 ? (blockWidth + blockMargin) / 2 : 0) + blockMargin;

            for (var j = 0; j < rowSize; j++) {
                var x = rowOffset + (blockWidth + blockMargin) * j;
                var block = game.add.sprite(x, y, 'block');
                game.physics.arcade.enable(block);
                block.body.immovable = true;
                block.width = blockWidth;
                block.height = blockHeight;
                this.blocks.add(block);
            }
        }
    },

    update: function() {
        this.paddle.body.position.x = game.math.clamp(game.input.x - this.paddle.width / 2, 0, game.world.width - this.paddle.width);

        game.physics.arcade.collide(this.paddle, this.ball);
        game.physics.arcade.collide(this.ball, this.blocks, function(ball, block) {
            block.kill();
        });

        if (this.ball.body.position.y > game.world.height + this.ball.height) {
            game.state.start('main');
        }
    }
};

game = new Phaser.Game(1200, 800, Phaser.AUTO, '', null, false, false);

game.state.add('menu', menuState);
game.state.add('main', mainState);
game.state.start('menu');
