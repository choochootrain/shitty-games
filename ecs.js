const ECS = window.ECS = {
    Components: {},
    systems: {},
    entities: [],
    game: {},
    score: 0
};

ECS.$canvas = document.getElementById('canvas');
ECS.context = ECS.$canvas.getContext('2d');
ECS.$canvas.width = 1024;
ECS.$canvas.height = 712;
ECS.$score = document.getElementById('score');

/* =========================================================================
 *
 * userInput.js
 *  This script contains the game logic acts as a controller for the Entity
 *  Component System
 *
 * ========================================================================= */

// start it off screen for non touch devices
const userInputPosition = {
    x: -100,
    y: -100,
    deltaX: false,
    deltaY: false
};

// Setup mouse handling
// --------------------------------------
function updateMousePosition(evt) {
    var rect = ECS.$canvas.getBoundingClientRect();
    userInputPosition.x = evt.clientX - rect.left;
    userInputPosition.y = evt.clientY - rect.top;
    userInputPosition.touch = false;
}

ECS.$canvas.addEventListener('mousemove', updateMousePosition, false);

// Setup the system
// --------------------------------------
ECS.systems.userInput = function systemUserInput ( entities ) {
    var curEntity = entities[PLAYER_ID];

    if( curEntity.components.playerControlled ){
        curEntity.components.position.x = userInputPosition.x;
        curEntity.components.position.y = userInputPosition.y;
    }
};

/* =========================================================================
 *
 * render.js
 *  This script contains the game logic acts as a controller for the Entity
 *  Component System
 *
 * ========================================================================= */
function clearCanvas () {
    // Store the current transformation matrix
    ECS.context.save();

    // Use the identity matrix while clearing the canvas
    ECS.context.setTransform(1, 0, 0, 1, 0, 0);
    ECS.context.clearRect(0, 0, ECS.$canvas.width, ECS.$canvas.height);

    // Restore the transform
    ECS.context.restore();
}


// ECS - System - Render
// --------------------------------------
ECS.systems.render = function systemRender ( entities ) {
    // XXX: add entity query
    // Here, we've implemented systems as functions which take in an array of
    // entities. An optimization would be to have some layer which only
    // feeds in relevant entities to the system, but for demo purposes we'll
    // assume all entities are passed in and iterate over them.

    // This happens each tick, so we need to clear out the previous rendered
    // state
    clearCanvas();

    // iterate over all entities
    for( var entityId in entities ){
        var curEntity = entities[entityId];

        // Only run logic if entity has relevant components
        //
        // For rendering, we need appearance and position. Your own render
        // system would use whatever other components specific for your game
        if( curEntity.components.appearance && curEntity.components.position ){

            // Build up the fill style based on the entity's color data
            var fillStyle = 'rgba(' + [
                curEntity.components.appearance.colors.r,
                curEntity.components.appearance.colors.g,
                curEntity.components.appearance.colors.b
            ] + ',1)';

            ECS.context.fillStyle = fillStyle;

            // Color big squares differently
            if(!curEntity.components.playerControlled &&
            curEntity.components.appearance.size > 12 &&
            curEntity.components.appearance.size < 100){
                ECS.context.fillStyle = 'rgba(0,0,0,0.8)';
            }

            // draw a little black line around every rect
            ECS.context.strokeStyle = 'rgba(0,0,0,1)';

            // draw the rect
            ECS.context.fillRect(
                curEntity.components.position.x - curEntity.components.appearance.size,
                curEntity.components.position.y - curEntity.components.appearance.size,
                curEntity.components.appearance.size * 2,
                curEntity.components.appearance.size * 2
            );
            // stroke it
            ECS.context.strokeRect(
                curEntity.components.position.x - curEntity.components.appearance.size,
                curEntity.components.position.y - curEntity.components.appearance.size,
                curEntity.components.appearance.size * 2,
                curEntity.components.appearance.size * 2
            );
        }
    }
};

/* =========================================================================
 *
 * decay.js
 *  This system "decays" entities that have a health component. Each tick
 *  decreases the size and health slightly
 *
 *  This is where a lot of the core gameplay experience comes from. Too slow,
 *  the game is too easy. If it decays to fast, the game isn't so fun.
 *
 * ========================================================================= */
// Setup the system
// --------------------------------------
ECS.systems.decay = function systemDecay ( entities ) {
    // Here, we've implemented systems as functions which take in an array of
    // entities. An optimization would be to have some layer which only
    // feeds in relevant entities to the system, but for demo purposes we'll
    // assume all entities are passed in and iterate over them.
    var curEntity;

    // iterate over all entities
    for( var entityId in entities ){
        curEntity = entities[entityId];

        // First, check if the entity is dead
        if(curEntity.components.playerControlled){
            if(curEntity.components.health.value < 0){
                // Dead! End game if player controlled
                game.endGame();
                return false;
            }
        }

        // Only run logic if entity has relevant components
        if( curEntity.components.health ){

            // Decrease health depending on current health
            // --------------------------
            // Here's where we configure how fun the game is
            if(curEntity.components.health.value < 0.7){
                curEntity.components.health.value -= 0.01;

            } else if(curEntity.components.health.value < 2){
                curEntity.components.health.value -= 0.03;

            } else if(curEntity.components.health.value < 10){
                curEntity.components.health.value -= 0.07;

            } else if(curEntity.components.health.value < 20){
                curEntity.components.health.value -= 0.15;
            } else {
                // If the square is huge, it should very quickly decay
                curEntity.components.health.value -= 1;
            }

            // Check for alive / dead
            // --------------------------
            if(curEntity.components.health.value >= 0){

                // Set style based on other components too - player controlled
                // entity should be style differently based on their health
                // Update appearance based on health
                // NOTE: Even though we set appearance properties here, they
                // don't get rendered here - they get rendered in the render
                // system
                if(curEntity.components.playerControlled){
                    if(curEntity.components.health.value > 10){
                        curEntity.components.appearance.colors.r = 50;
                        curEntity.components.appearance.colors.g = 255;
                        curEntity.components.appearance.colors.b = 50;
                    } else {
                        curEntity.components.appearance.colors.r = 255;
                        curEntity.components.appearance.colors.g = 50;
                        curEntity.components.appearance.colors.b = 50;
                    }
                }

                // Entity is still ALIVE
                if(curEntity.components.appearance.size){
                    curEntity.components.appearance.size = curEntity.components.health.value;
                }

            } else {

                //Entity is DEAD
                if(curEntity.components.playerControlled){

                    // Dead! End game if player controlled
                    game.endGame();
                } else {
                    // otherwise, remove the entity
                    delete entities[entityId];
                }
            }
        } else if (curEntity.components.timedComponentChange) {
            if (curEntity.components.timedComponentChange.wait < game.time.now) {
                var component = curEntity.components.timedComponentChange.component;

                curEntity.components.timedComponentChange.change(
                    curEntity.components[component]);

                curEntity.removeComponent('timedComponentChange');
            }
        };
    }
};

/* =========================================================================
 *
 * collision.js
 *   This system checks to see if a usermovable entity is colliding with any
 *   other entities that have a collision component
 *
 * ========================================================================= */
// Basic collision detection for rectangle intersection (NOTE: again, this would
// live inside the system itself)
function doesIntersect(obj1, obj2) {
    // Takes in two objects with position and size properties
    //  obj1: player controlled position and size
    //  obj2: object to check
    //
    var rect1 = {
        x: obj1.position.x - obj1.size,
        y: obj1.position.y - obj1.size,
        height: obj1.size * 2,
        width: obj1.size * 2
    };
    var rect2 = {
        x: obj2.position.x - obj2.size,
        y: obj2.position.y - obj2.size,
        height: obj2.size * 2,
        width: obj2.size * 2
    };

    return (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y);
}

// Collision system
// --------------------------------------
ECS.systems.collision = function systemCollision ( entities ) {
    // Here, we've implemented systems as functions which take in an array of
    // entities. An optimization would be to have some layer which only

    // assume all entities are passed in and iterate over them.

    var curEntity;
    var entityIdsCollidedWith = [];

    // iterate over all entities
    for( var entityId in entities ){
        curEntity = entities[entityId];

        // Only check for collision on player controllable entities
        // (playerControlled) and entities with a collision component
        if( curEntity.components.appearance &&
            curEntity.components.playerControlled &&
            curEntity.components.position ){

            // Systems can also modify components...
            // Clear out existing collision appearance property
            curEntity.components.appearance.colors.r = 0;

            // test for intersection of player controlled rects vs. all other
            // collision rects
            for( var entityId2 in entities){
                // Don't check player controller entities for collisions
                // (otherwise, it'd always be true)
                if( !entities[entityId2].components.playerControlled &&
                    entities[entityId2].components.position &&
                    entities[entityId2].components.collision &&
                    entities[entityId2].components.appearance ){

                    if( doesIntersect(
                        {
                            position: curEntity.components.position,
                            size: curEntity.components.appearance.size
                        },
                        {
                            position: entities[entityId2].components.position,
                            size: entities[entityId2].components.appearance.size
                        }
                    )){
                        curEntity.components.appearance.colors.r = 255;
                        entities[entityId2].components.appearance.colors.r = 150;

                        // Don't modify the array in place; we're still iterating
                        // over it
                        entityIdsCollidedWith.push(entityId);
                        var negativeDamageCutoff = 12;

                        if(curEntity.components.health){
                            // Increase the entity's health, it ate something
                            curEntity.components.health.value += Math.max(
                                -2,
                                negativeDamageCutoff - entities[entityId2].components.appearance.size
                            );

                            // extra bonus for hitting small entities
                            if(entities[entityId2].components.appearance.size < 1.3){
                                if(curEntity.components.health.value < 30){
                                    // Add some bonus health if it's really small,
                                    // but don't let it get out of control
                                    curEntity.components.health.value += 9;
                                }
                            }
                            if ( entities[entityId2].components.appearance.size > negativeDamageCutoff ){
                                entities[SCREEN_ID].addComponent( new ECS.Components.TimedComponentChange({
                                    wait: game.time.now + 100,
                                    component: 'appearance',
                                    change: (app) => {
                                        app.colors.r = 127;
                                        app.colors.g = 127;
                                        app.colors.b = 127;
                                    }
                                }));

                                entities[SCREEN_ID].components.appearance.colors.r = 0;
                                entities[SCREEN_ID].components.appearance.colors.g = 0;
                                entities[SCREEN_ID].components.appearance.colors.b = 0;

                                // substract even more health from the player
                                // but don't let it take away more than 5 dm
                                curEntity.components.health.value -= Math.min(
                                    5,
                                    entities[entityId2].components.appearance.size - negativeDamageCutoff
                                );


                            } else {
                                entities[SCREEN_ID].addComponent( new ECS.Components.TimedComponentChange({
                                    wait: game.time.now + 100,
                                    component: 'appearance',
                                    change: (app) => {
                                        app.colors.r = 127;
                                        app.colors.g = 127;
                                        app.colors.b = 127;
                                    }
                                }));

                                entities[SCREEN_ID].components.appearance.colors.r = 255;
                                entities[SCREEN_ID].components.appearance.colors.g = 255;
                                entities[SCREEN_ID].components.appearance.colors.b = 255;
                            }
                        }

                        // update the score
                        ECS.score++;
                        ECS.$score.innerHTML = ECS.score;

                        delete ECS.entities[entityId2];

                        break;
                    }
                }
            }
        }
    }

    // Add new entities if the player collided with any entities
    // ----------------------------------
    var chanceDecay = 0.8;
    var numNewEntities = 3;

    if(ECS.score > 100){
        chanceDecay = 0.6;
        numNewEntities = 4;
    }

    if(entityIdsCollidedWith.length > 0){
        for(i=0; i<entityIdsCollidedWith.length; i++){
            var newEntity;

            // Don't add more entities if there are already too many
            if(Object.keys(ECS.entities).length < 30){

                for(var k=0; k < numNewEntities; k++){
                    // Add some new collision rects randomly
                    if(Math.random() < 0.8){
                        newEntity = new ECS.Assemblages.CollisionRect();
                        ECS.entities[newEntity.id] = newEntity;

                        // add a % chance that they'll decay
                        if(Math.random() < chanceDecay){
                            newEntity.addComponent( new ECS.Components.Health() );
                        }
                    }
                }

            }
        }
    }
};

/* =========================================================================
 *
 * Entity.js
 *  Definition of our "Entity". Abstractly, an entity is basically an ID.
 *  Here we implement an entity as a container of data (container of components)
 *
 * ========================================================================= */
ECS.Entity = function Entity(id){
    // Generate a pseudo random ID
    this.id = id || (+new Date()).toString(16) +
        (Math.random() * 100000000 | 0).toString(16) +
        ECS.Entity.prototype._count;

    // increment counter
    ECS.Entity.prototype._count++;

    // The component data will live in this object
    this.components = {};

    return this;
};
// keep track of entities created
ECS.Entity.prototype._count = 0;

ECS.Entity.prototype.addComponent = function addComponent ( component ){
    // Add component data to the entity
    this.components[component.name] = component;
    return this;
};
ECS.Entity.prototype.removeComponent = function removeComponent ( componentName ){
    // Remove component data by removing the reference to it.
    // Allows either a component function or a string of a component name to be
    // passed in
    var name = componentName; // assume a string was passed in

    if(typeof componentName === 'function'){
        // get the name from the prototype of the passed component function
        name = componentName.prototype.name;
    }

    delete this.components[name];
    return this;
};

ECS.Entity.prototype.print = function print () {
    // Function to print / log information about the entity
    console.log(JSON.stringify(this, null, 4));
    return this;
};

/* =========================================================================
 *
 * Components.js
 *  This contains all components for the tutorial (ideally, components would
 *  each live in their own module)
 *
 *  Components are just data.
 *
 * ========================================================================= */

// Appearance
// --------------------------------------
ECS.Components.Appearance = function ComponentAppearance ( params ){
    // Appearance specifies data for color and size
    params = params || {};

    this.colors = params.colors;
    if(!this.colors){
        // generate random color if not passed in (get 6 random hex values)
        this.colors = {
            r: 0,
            g: 100,
            b: 150
        };
    }

    this.size = params.size || (1 + (Math.random() * 30 | 0));

    return this;
};
ECS.Components.Appearance.prototype.name = 'appearance';

// Health
// --------------------------------------
ECS.Components.Health = function ComponentHealth ( value ){
    value = value || 20;
    this.value = value;

    return this;
};
ECS.Components.Health.prototype.name = 'health';

// Position
// --------------------------------------
ECS.Components.Position = function ComponentPosition ( params ){
    params = params || {};

    // Generate random values if not passed in
    // NOTE: For the tutorial we're coupling the random values to the canvas'
    // width / height, but ideally this would be decoupled (the component should
    // not need to know the canvas's dimensions)
    this.x = params.x || 20 + (Math.random() * (ECS.$canvas.width - 20) | 0);
    this.y = params.y || 20 + (Math.random() * (ECS.$canvas.height - 20) | 0);

    return this;
};
ECS.Components.Position.prototype.name = 'position';

// playerControlled
// --------------------------------------
ECS.Components.PlayerControlled = function ComponentPlayerControlled ( params ){
    this.pc = true;
    return this;
};
ECS.Components.PlayerControlled.prototype.name = 'playerControlled';

// Collision
// --------------------------------------
ECS.Components.Collision = function ComponentCollision ( params ){
    this.collides = true;
    return this;
};
ECS.Components.Collision.prototype.name = 'collision';

// TimedComponentChange
// -------------------------------------
ECS.Components.TimedComponentChange = function TimedComponentChange( params ) {
    this.wait = params.wait;
    this.component = params.component;
    this.change = params.change;
    return this;
};
ECS.Components.TimedComponentChange.prototype.name = 'timedComponentChange';

/* =========================================================================
 *
 * Assemblages.js
 *  Contains assemblages. Assemblages are essentially entity "templates"
 *
 * ========================================================================= */

ECS.Assemblages = {
    // Each assemblage creates an entity then returns it. The entity can
    // then have components added or removed - this is just like a helper
    // factory to create objects which can still be modified

    CollisionRect: function CollisionRect(){
        var entity = new ECS.Entity();
        entity.addComponent( new ECS.Components.Appearance());
        entity.addComponent( new ECS.Components.Position());
        entity.addComponent( new ECS.Components.Collision());

        return entity;
    },

    Player: function Player(playerId) {
        var entity = new ECS.Entity(playerId);
        entity.addComponent( new ECS.Components.Appearance());
        entity.addComponent( new ECS.Components.Position());
        entity.addComponent( new ECS.Components.PlayerControlled() );
        entity.addComponent( new ECS.Components.Health() );
        entity.addComponent( new ECS.Components.Collision() );

        entity.components.appearance.colors.g = 255;

        return entity;
    }

};
