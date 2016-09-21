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

        this.walls = game.add.group();
        var wallTop = game.add.sprite(0, -1, 'block');
        wallTop.width = game.world.width;
        wallTop.height = 1;
        game.physics.arcade.enable(wallTop);
        wallTop.body.immovable = true;
        wallTop.alpha = 0;
        this.walls.add(wallTop);

        var wallLeft = game.add.sprite(-1, 0, 'block');
        wallLeft.width = 1;
        wallLeft.height = game.world.height;
        game.physics.arcade.enable(wallLeft);
        wallLeft.body.immovable = true;
        wallLeft.alpha = 0;
        this.walls.add(wallLeft);

        var wallRight = game.add.sprite(game.world.width, 0, 'block');
        wallRight.width = 1;
        wallRight.height = game.world.height;
        game.physics.arcade.enable(wallRight);
        wallRight.body.immovable = true;
        wallRight.alpha = 0;
        this.walls.add(wallRight);

        this.ball = game.add.sprite(game.world.centerX, game.world.centerY, 'block');
        this.ball.anchor.x = 0.5;
        this.ball.anchor.y = 0.5;
        game.physics.arcade.enable(this.ball);
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
        game.physics.arcade.collide(this.ball, this.walls, function(ball, wall) {
            this.juicy.overScale(ball, 1.7);
        }.bind(this));

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
        }.bind(this));

        game.physics.arcade.collide(this.ball, this.blocks, function(ball, block) {
            this.shakeFactor = game.math.clamp(this.shakeFactor * 1.1, 2, 10);

            var emitter = game.add.emitter(game.world.centerX, game.world.centerY, 50);
            emitter.makeParticles('block', 0, 50, true);
            emitter.x = block.body.position.x;
            emitter.y = block.y;
            emitter.setSize(block.width, block.height);
            emitter.gravity = 1000;
            emitter.setAlpha(0.1, 0.8, 200, Phaser.Easing.Exponential.Quadratic);
            emitter.minParticleScale = 0.2;
            emitter.maxParticleScale = 0.7;
            emitter.minParticleSpeed.x = -this.shakeFactor * 100;
            emitter.minParticleSpeed.y = -this.shakeFactor * 100;
            emitter.maxParticleSpeed.x = this.shakeFactor * 100;
            emitter.maxParticleSpeed.y = this.shakeFactor * 100;
            emitter.forEach(function(particle) {
                particle.tint = block.tint;
            });
            emitter.explode(1500, 10 + Math.random() * (4 * this.shakeFactor));
            game.time.events.add((10.1 - this.shakeFactor) * 100 * Math.random() + 1000, function() {
                emitter.forEach(function(particle) {
                    var tween = game.add.tween(particle);
                    tween.to({
                        "alpha": 0,
                        "width": 5,
                        "height": 5
                    }, 3000 + 3000 * Math.random(), Phaser.Easing.Exponential.Quadratic, true);
                    tween.onComplete.add(function(particle, tween) {
                        particle.kill();
                    });
                });
                emitter.kill();
            });

            ball.body.angularVelocity += (1000 * Math.random()) - 500;

            this.juicy.overScale(ball, 2);
            this.juicy.shake(this.shakeFactor);
            block.alive = false;
            block.kill();
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
