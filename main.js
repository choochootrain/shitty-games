var game;

function createBall() {
    var ball = game.add.sprite(game.world.centerX, game.world.centerY, 'block');
    ball.tag = 'ball';
    game.physics.arcade.enable(ball);
    ball.body.collideWorldBounds = true;
    ball.body.velocity.x = 500;
    ball.body.velocity.y = 500;
    ball.body.bounce.setTo(1, 1);

    ball.collider = {
        onCollision: new Phaser.Signal()
    };

    return ball;
}

function createPaddle() {
    var paddle = game.add.sprite(game.world.centerX, game.world.height - 40, 'block');
    paddle.tag = 'paddle';
    paddle.width = 200;
    paddle.height = 32;
    game.physics.arcade.enable(paddle);
    paddle.body.immovable = true;
    paddle.body.bounce.setTo(1, 1);

    paddle.collider = {
        onCollision: new Phaser.Signal()
    };

    paddle.input = {
        onInput: new Phaser.Signal()
    };

    paddle.input.onInput.add(function(x, y) {
        paddle.body.position.x = game.math.clamp(x - paddle.width / 2, 0, game.world.width - paddle.width);
    }, this);

    return paddle;
}

function createBlock(x, y, blockWidth, blockHeight) {
    var block = game.add.sprite(x, y, 'block');
    block.tag = 'block';
    game.physics.arcade.enable(block);
    block.body.immovable = true;
    block.width = blockWidth;
    block.height = blockHeight;

    block.collider = {
        onCollision: new Phaser.Signal()
    };

    block.collider.onCollision.add(function(other) {
        if (other.tag === 'ball') {
            block.body.immovable = false;
            block.body.gravity.y = 100;
        } else if (other.tag === 'paddle') {
            block.body.velocity.y = -block.body.velocity.y;
        } else if (other.tag === 'block') {
            block.kill();
        }
    }, this);

    return block;
}

var mainState = {
    preload: function() {
        game.load.image('block', 'assets/block.jpg');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.setBounds(0, 0, game.world.width, game.world.height + 100);

        this.entities = [ createBall(), createPaddle() ];

        for (var i = 0; i < game.world.width; i += 110) {
            for (var j = game.world.height / 2; j > 0; j -= 74) {
                this.entities.push(createBlock(i, j, 100, 64));
            }
        }
    },

    update: function() {
        //input system
        for (var i = 0; i < this.entities.length; i++) {
            var e = this.entities[i];

            // ignore non inputtable entities
            if (!e.input) continue;

            e.input.onInput.dispatch(game.input.x, game.input.y);
        }


        //collision system
        for (var i = 0; i < this.entities.length; i++) {
            for (var j = i + 1; j < this.entities.length; j++) {
                var a = this.entities[i];
                var b = this.entities[j];


                // ignore non collidable pairs
                if (!a.collider || !b.collider) continue;

                if (game.physics.arcade.collide(a, b)) {
                    a.collider.onCollision.dispatch(b);
                    b.collider.onCollision.dispatch(a);
                }
            }
        }
    }
};

game = new Phaser.Game(1200, 800, Phaser.AUTO, '', null, false, false);

game.state.add('main', mainState);
game.state.start('main');
