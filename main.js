var game;

var colors = [
    0xF92672,
    0x66D9EF,
    0xA6E22E,
    0xFD971F
];

var menuState = {
    preload: function() {
        game.load.image('menu', 'assets/menu.png');
    },

    create: function() {
        game.stage.backgroundColor = 0x272822;

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
        game.load.image('block', 'assets/block.png');
    },

    create: function() {
        game.stage.backgroundColor = 0x272822;

        this.juicy = game.plugins.add(new Phaser.Plugin.Juicy(this));

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.setBounds(0, 0, game.world.width, game.world.height + 100);

        this.ball = game.add.sprite(0, 0, 'block');
        this.ball.anchor.x = 0.5;
        this.ball.anchor.y = 0.5;
        game.physics.arcade.enable(this.ball);
        this.ball.body.collideWorldBounds = true;
        this.ball.body.velocity.x = 600;
        this.ball.body.velocity.y = 600;
        this.ball.body.bounce.setTo(1, 1);
        this.ball.body.angularDrag = 500;
        this.shakeFactor = 2;

        this.paddle = game.add.sprite(game.world.centerX, game.world.height - 40, 'block');
        this.paddle.tint = 0xABAA98;

        this.paddle.width = 200;
        this.paddle.height = 32;
        game.physics.arcade.enable(this.paddle);
        this.paddle.body.immovable = true;

        this.blocks = game.add.group();
        var numRows = 10;
        var maxBlockRowSize = 17;
        var blockHeight = 32;
        var blockPadding = 5;
        var blockMargin = 50;
        for (var i = 0; i < numRows; i++) {
            var y = i * (blockHeight + blockPadding) + blockPadding + blockMargin;
            var rowSize = i % 2 === 1 ? maxBlockRowSize - 1 : maxBlockRowSize;

            var blockWidth = ((game.world.width - 2 * blockMargin) - (maxBlockRowSize + 1) * blockPadding) / maxBlockRowSize;

            var rowOffset = (i % 2 === 1 ? (blockWidth + blockPadding) / 2 : 0) + blockMargin;

            for (var j = 0; j < rowSize; j++) {
                var x = rowOffset + (blockWidth + blockPadding) * j;
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
                if ((i < numRows / 2 - 2 || i >= numRows / 2 + 2) ||
                    (j < rowSize / 2 - 2 || j >= rowSize / 2 + 2)) {
                    block.tint = colors[i % colors.length];
                } else {
                    block.tint = 0xFFF7FB;
                }
                this.blocks.add(block);

            }
        }
    },

    update: function() {
        this.paddle.body.position.x = game.math.clamp(game.input.x - this.paddle.width / 2, 0, game.world.width - this.paddle.width);

        game.physics.arcade.collide(this.paddle, this.ball, function(paddle, ball) {
            if (ball.body.position.y + ball.height / 2 > paddle.body.position.y) {
                return;
            }

            this.juicy.overScale(ball, 1.7);
            this.shakeFactor = 2;

            var paddleCenter = paddle.body.position.x + paddle.width / 2;

            var eccentricity = 0.6 * game.math.clamp((ball.body.position.x - paddleCenter) / (paddle.width / 2), -1, 1);
            var magnitude = ball.body.velocity.getMagnitude();
            ball.body.velocity.x = magnitude * Math.sin(Math.PI / 2 * eccentricity);
            ball.body.velocity.y = -magnitude * Math.cos(Math.PI / 2 * eccentricity);

            ball.body.velocity.rotate(0, 0, Math.PI / 6 * eccentricity);
            ball.body.angularVelocity = 100000 * eccentricity;
            console.log(ball.body.angularVelocity);
        }.bind(this));

        game.physics.arcade.collide(this.ball, this.blocks, function(ball, block) {
            ball.body.angularVelocity += (1000 * Math.random()) - 500;
            console.log(ball.body.angularVelocity);

            this.juicy.overScale(ball, 2);
            this.shakeFactor = game.math.clamp(this.shakeFactor * 1.1, 2, 10);
            this.juicy.shake(this.shakeFactor);
            block.alive = false;

            game.world.sendToBack(block);
            block.anchor.x = 0.5;
            block.anchor.y = 0.5;
            var blockShrink =  0.5;
            var blockFall = 500;
            var blockScatter = 100;
            var blockAnimation = 1000;
            var tween = game.add.tween(block);
            tween.to({
                "width": block.width * blockShrink,
                "height": block.height * blockShrink,
                "rotation": (4 * Math.random() - 2) * Math.PI,
                "x": block.body.position.x + (2 * Math.random() - 1) * blockScatter,
                "y": block.body.position.y + blockFall,
                "alpha": 0.2
            }, blockAnimation, Phaser.Easing.Exponential.Quadratic, true);
            tween.onComplete.add(function(block, tween) {
                block.kill();
            }.bind(this));
        }.bind(this), function(ball, block){
            return block.alive;
        });

        if (this.ball.body.position.y + this.ball.height / 2 > game.world.height) {
            game.state.start('main');
        }
    }
};

game = new Phaser.Game(1200, 800, Phaser.AUTO, '', null, false, false);

game.state.add('menu', menuState);
game.state.add('main', mainState);
game.state.start('menu');
