const SCREEN_ID = window.SCREEN_ID = "SCREEN";
const PLAYER_ID = window.PLAYER_ID = "PLAYER_ID";

const Game = function (){
    // This is our "main" function which controls everything. We setup the
    // systems to loop over, setup entities, and setup and kick off the game
    // loop.
    var self = this;

    this.time = {
        start: null,
        now: null,
        delta: 0,
    };

    var screen = new ECS.Entity(SCREEN_ID);
    screen.addComponent( new ECS.Components.Appearance({
        size: 800,
        colors: { r: 127, g: 127, b: 127 }
    }));
    screen.addComponent( new ECS.Components.Position({ x: 0, y: 0 }));
    ECS.entities[SCREEN_ID] = screen;

    // Create a bunch of random entities
    for(var i=0; i < 20; i++){
        var entity = ECS.Assemblages.CollisionRect();

        // % chance for decaying rects
        if(Math.random() < 0.8){
            entity.addComponent( new ECS.Components.Health() );
        }

        ECS.entities[entity.id] = entity;
    }

    // PLAYER entity
    // ----------------------------------
    // Make the last entity the "PC" entity - it must be player controlled,
    // have health and collision components
    var player = ECS.Assemblages.Player(PLAYER_ID);
    ECS.entities[PLAYER_ID] = player;

    // Setup systems
    // ----------------------------------
    // Setup the array of systems. The order of the systems is likely critical,
    // so ensure the systems are iterated in the right order
    var systems = [
        ECS.systems.userInput,
        ECS.systems.collision,
        ECS.systems.decay,
        ECS.systems.render,
    ];

    // Game loop
    // ----------------------------------
    function gameLoop (now){
        if (!self.time.start) self.time.start = now;
        if (!self.time.now) self.time.now = now;

        self.time.delta = now - self.time.now;
        self.time.now = now;

        for(var i=0,len=systems.length; i < len; i++){
            // Call the system and pass in entities
            // XXX: One optimal solution would be to only pass in entities
            // that have the relevant components for the system, instead of
            // forcing the system to iterate over all entities
            systems[i](ECS.entities);
        }

        if(self._running !== false){
            requestAnimationFrame(gameLoop);
        }
    }

    requestAnimationFrame(gameLoop);

    this._running = true;
    this.endGame = function endGame(){
        self._running = false;
        document.getElementById('score').innerHTML = "GAME OVER " + ECS.score;
    };


    return this;
};

// Kick off the game
const game = new Game();
