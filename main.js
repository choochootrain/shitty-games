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
        this.juicy = game.plugins.add(new Phaser.Plugin.Juicy(this));

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.setBounds(0, 0, game.world.width, game.world.height + 100);

        this.ball = game.add.sprite(game.world.centerX, game.world.centerY, 'block');
        game.physics.arcade.enable(this.ball);
        this.ball.width = 20;
        this.ball.height = 20;
        this.ball.body.collideWorldBounds = true;
        this.ball.body.velocity.x = 300;
        this.ball.body.velocity.y = 300;
        this.ball.body.bounce.setTo(1, 1);

        this.paddle = game.add.sprite(game.world.centerX, game.world.height - 40, 'block');
        this.paddle.width = 200;
        this.paddle.height = 32;
        game.physics.arcade.enable(this.paddle);
        this.paddle.body.immovable = true;
        this.paddle.body.bounce.setTo(1, 1);

        this.blocks = game.add.group();
        var numRows = 6;
        var maxBlockRowSize = 10;
        var blockHeight = 30;
        var blockMargin = 25;
        var blockMarginTop = 50;
        for (var i = 0; i < numRows; i++) {
            var y = i * (blockHeight + blockMargin) + blockMargin + blockMarginTop;
            var rowSize = i % 2 === 1 ? maxBlockRowSize - 1 : maxBlockRowSize;

            var blockWidth = (game.world.width - (maxBlockRowSize + 1) * blockMargin) / maxBlockRowSize;

            var rowOffset = (i % 2 === 1 ? (blockWidth + blockMargin) / 2 : 0) + blockMargin;

            for (var j = 0; j < rowSize; j++) {
                var x = rowOffset + (blockWidth + blockMargin) * j;
                var block = game.add.sprite(game.world.centerX, -100, 'block');
                var tween = game.add.tween(block);
                tween.to({
                    "x": x,
                    "y": y
                }, 200 + 100 * Math.random(), Phaser.Easing.Exponential.Quadratic, true, 300 * Math.random());

                game.physics.arcade.enable(block);
                block.body.immovable = true;
                block.width = blockWidth;
                block.height = blockHeight;
                block.alive = true;
                this.blocks.add(block);
            }
        }
    },

    update: function() {
        this.paddle.body.position.x = game.math.clamp(game.input.x - this.paddle.width / 2, 0, game.world.width - this.paddle.width);

        game.physics.arcade.collide(this.paddle, this.ball, function(paddle, ball) {
            if (ball.body.position.y + ball.height > paddle.body.position.y) {
                return;
            }

            this.juicy.shake();

            var paddleCenter = paddle.body.position.x + paddle.width / 2;
            var ballCenter = ball.body.position.x + ball.width / 2;

            var eccentricity = 0.6 * game.math.clamp((ballCenter - paddleCenter) / (paddle.width / 2), -1, 1);
            var magnitude = ball.body.velocity.getMagnitude();
            ball.body.velocity.x = magnitude * Math.sin(Math.PI / 2 * eccentricity);
            ball.body.velocity.y = -magnitude * Math.cos(Math.PI / 2 * eccentricity);

            ball.body.velocity.rotate(0, 0, Math.PI / 6 * eccentricity);
        }.bind(this));

        game.physics.arcade.collide(this.ball, this.blocks, function(ball, block) {
            this.juicy.shake();
            block.alive = false;

            var blockGrowth =  0.3;
            var blockAnimation = 200;
            var tween = game.add.tween(block);
            tween.to({
                "width": 0,
                "height": 0,
                "x": block.body.position.x + (1 / 2) *  block.width,
                "y": block.body.position.y + (1 / 2) *  block.height,
                "alpha": 0
            }, blockAnimation, Phaser.Easing.Exponential.Quadratic, true);
            tween.onComplete.add(function(block, tween) {
                block.kill();
            }.bind(this));
        }.bind(this), function(ball, block){
            return block.alive;
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
