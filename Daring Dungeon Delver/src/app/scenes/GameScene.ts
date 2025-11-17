// src/scenes/GameScene.ts - FINAL TUNED VERSION

import Phaser from 'phaser';

enum Direction {
    NONE,
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private pellets!: Phaser.Physics.Arcade.Group;
    private score: number = 0;
    private lives: number = 3;

    private map!: Phaser.Tilemaps.Tilemap;
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private collisionObjects!: Phaser.Physics.Arcade.StaticGroup;

    private readonly speed = 200;
    private readonly tileSize = 32;
    private currentDirection = Direction.NONE;
    private queuedDirection = Direction.NONE;

    private loopZones!: Phaser.Physics.Arcade.Group;
    private marker!: Phaser.Math.Vector2;
    private turnPoint!: Phaser.Math.Vector2
    constructor() {
        super('GameScene');
    }

    create() {
        // UI overlay is provided by the Vue layer (GameView + GameUI),
        // so we no longer launch the internal UIScene here.
        this.map = this.make.tilemap({ key: 'map' });

        const tilesetGrass = this.map.addTilesetImage('TX tileset Grass', 'grass')!;
        const tilesetWall = this.map.addTilesetImage('TX tileset wall', 'wall')!;
        const tilesetStoneGround = this.map.addTilesetImage('TX tileset stone ground', 'stone_ground')!;
        const tilesetProps = this.map.addTilesetImage('tx tileset props', 'props')!;
        const tilesetStruct = this.map.addTilesetImage('tx struct', 'struct')!;

        const allTilesets = [tilesetGrass, tilesetWall, tilesetStoneGround, tilesetProps, tilesetStruct];

        this.map.createLayer('background', allTilesets);
        this.groundLayer = this.map.createLayer('Floor', allTilesets)!;
        this.map.createLayer('walls1', allTilesets);
        this.map.createLayer('Walls2', allTilesets);
        this.map.createLayer('Corners1', allTilesets);
        this.map.createLayer('Corners2', allTilesets);
        this.map.createLayer('Corner3', allTilesets);
        this.map.createLayer('Corner4', allTilesets);
        this.map.createLayer('overlay', allTilesets);
        this.map.createLayer('decoration', allTilesets);
        this.map.createLayer('Pillar', allTilesets);
        this.map.createLayer('Writing', allTilesets);
        
        this.collisionObjects = this.physics.add.staticGroup();
        const collisionLayer = this.map.getObjectLayer('Collision')!;
        collisionLayer.objects.forEach(obj => {
            const rect = this.add.rectangle(obj.x! + obj.width! / 2, obj.y! + obj.height! / 2, obj.width, obj.height);
            this.collisionObjects.add(rect);
        });
// --- THIS IS THE CORRECTED, BULLETPROOF LOOP ZONE CREATION ---
        this.loopZones = this.physics.add.group({ allowGravity: false });
        const collisionLoopLayer = this.map.getObjectLayer('CollisionLoop')!;
        collisionLoopLayer.objects.forEach(obj => {
            const zone = this.add.rectangle(obj.x! + obj.width! / 2, obj.y! + obj.height! / 2, obj.width, obj.height);
            this.loopZones.add(zone);

            // 1. First, try to find the property.
            const teleportProp = obj.properties?.find((p: any) => p.name === 'teleportTo');

            // 2. ONLY if the property was found, set the data on the zone.
            if (teleportProp) {
                zone.setData('teleportTo', teleportProp.value);
            } else {
                // This warning will help you debug your map in the future!
                console.warn(`Tiled object with ID ${obj.id} in 'CollisionLoop' layer is missing the 'teleportTo' custom property.`);
            }
        });

    


        this.pellets = this.physics.add.group({ allowGravity: false });
        const pelletLayer = this.map.getObjectLayer('Pellet(big)')!;
        pelletLayer.objects.forEach(obj => {
            const cx = obj.x! + obj.width! / 2;
            const cy = obj.y! + obj.height! / 2;
            const coin = this.pellets.create(cx, cy, 'coin_hd');
            const finalSize = 64;
            coin.setDisplaySize(finalSize, finalSize);
            coin.refreshBody();
        });
        
        
        const playerStart = this.map.findObject('PlayerStart', obj => obj.name === '')!;
        const startX = playerStart.x! + this.tileSize / 2;
        const startY = playerStart.y! + this.tileSize / 2;
        this.player = this.physics.add.sprite(startX, startY, 'player_walk');
        
        // --- TUNING FIX 1: Make the body slightly smaller for more clearance ---
        this.player.body!.setSize(28, 28);
        // Recalculate the offset to keep it centered: (100 - 28) / 2 = 36
        this.player.body!.setOffset(36, 36);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.collisionObjects);
        
        this.physics.add.overlap(this.player, this.pellets, (player, pellet) => {
            const coin = pellet as Phaser.Physics.Arcade.Sprite;
            coin.disableBody(true, true);
            this.score += 100;
            // Legacy event used by the old UIScene (kept for compatibility)
            this.events.emit('scoreChanged', this.score);
            // New global UI event used by the Vue overlay (same as Matter engine)
            this.game.events.emit('score-update', this.score);

            // If all pellets are collected, consider the level complete
            if (this.pellets.countActive(true) === 0) {
                this.handleLevelComplete();
            }
        }, undefined, this);

        // --- THIS IS THE CORRECTED OVERLAP LOGIC ---
        this.physics.add.overlap(this.player, this.loopZones, (player, zone) => {
            const playerSprite = player as Phaser.Physics.Arcade.Sprite;
            const zoneObject = zone as Phaser.GameObjects.Rectangle;
            
            const teleportTo = zoneObject.getData('teleportTo');
            
            // --- THE CRITICAL FIX: The Directional Check ---
            // Only teleport if the player is moving in the correct direction to enter the zone.
            let shouldTeleport = false;
            if (teleportTo === 'right' && this.currentDirection === Direction.LEFT) {
                shouldTeleport = true;
            } else if (teleportTo === 'left' && this.currentDirection === Direction.RIGHT) {
                shouldTeleport = true;
            } else if (teleportTo === 'bottom' && this.currentDirection === Direction.UP) {
                shouldTeleport = true;
            } else if (teleportTo === 'top' && this.currentDirection === Direction.DOWN) {
                shouldTeleport = true;
            }

            if (shouldTeleport) {
                const buffer = this.player.body!.width; 

                switch (teleportTo) {
                    case 'right': playerSprite.x = this.physics.world.bounds.width - buffer; break;
                    case 'left': playerSprite.x = buffer; break;
                    case 'bottom': playerSprite.y = this.physics.world.bounds.height - buffer; break;
                    case 'top': playerSprite.y = buffer; break;
                }

                // Resync the movement marker after teleporting
                const newTileX = this.groundLayer.worldToTileX(playerSprite.x);
                const newTileY = this.groundLayer.worldToTileY(playerSprite.y);
                this.marker.set(newTileX, newTileY);
                this.turnPoint.set(
                    newTileX * this.tileSize + this.tileSize / 2,
                    newTileY * this.tileSize + this.tileSize / 2
                );
            }
        }, undefined, this);
        
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Initialize the marker system at the end of create()
        const startTileX = this.groundLayer.worldToTileX(this.player.x);
        const startTileY = this.groundLayer.worldToTileY(this.player.y);
        this.marker = new Phaser.Math.Vector2(startTileX, startTileY);
        this.turnPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);

        // Emit initial UI state for the Vue overlay
        this.game.events.emit('score-update', this.score);
        this.game.events.emit('lives-update', this.lives);
    }



// --- THIS IS THE NEW, SIMPLE, AND CORRECT HELPER FUNCTION ---
    private isPathClear(x: number, y: number): boolean {
        // 1. Get the player's body dimensions.
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        const bodyWidth = playerBody.width;
        const bodyHeight = playerBody.height;

        // 2. Create a virtual geometric Rectangle representing the player's body at the target center position (x, y).
        const checkRect = new Phaser.Geom.Rectangle(
            x - bodyWidth / 2, 
            y - bodyHeight / 2, 
            bodyWidth, 
            bodyHeight
        );

        // 3. Get all the wall objects from our collision group.
        const collisionRects = this.collisionObjects.getChildren();

        // 4. Loop through each wall and check for a geometric intersection.
        for (const rect of collisionRects) {
            const wallBounds = (rect as Phaser.GameObjects.Rectangle).getBounds();

            // 5. Use Phaser's simple and reliable intersection function.
            if (Phaser.Geom.Intersects.RectangleToRectangle(checkRect, wallBounds)) {
                // If the player's virtual body intersects with ANY wall, the path is blocked.
                return false;
            }
        }

        // If the loop completes without finding any intersections, the path is clear.
        return true;
    }


// --- YOUR UPDATE METHOD WITH THE MISSING LOGIC RE-INSERTED ---
    update() {
        if (!this.player || !this.player.body) { return; }

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const playerX = this.player.x;
        const playerY = this.player.y;

        const leftDown = this.cursors.left.isDown;
        const rightDown = this.cursors.right.isDown;
        const upDown = this.cursors.up.isDown;
        const downDown = this.cursors.down.isDown;

        if (leftDown) { this.queuedDirection = Direction.LEFT; } 
        else if (rightDown) { this.queuedDirection = Direction.RIGHT; } 
        else if (upDown) { this.queuedDirection = Direction.UP; } 
        else if (downDown) { this.queuedDirection = Direction.DOWN; }
        else {
            // Si no hay teclas presionadas, el héroe se detiene
            this.queuedDirection = Direction.NONE;
            this.currentDirection = Direction.NONE;
        }

        const tolerance = 14; // A generous tolerance
        const tileX = Math.floor(playerX / this.tileSize);
        const tileY = Math.floor(playerY / this.tileSize);
        const centerX = tileX * this.tileSize + this.tileSize / 2;
        const centerY = tileY * this.tileSize + this.tileSize / 2;
        const isCenteredX = Math.abs(playerX - centerX) < tolerance;
        const isCenteredY = Math.abs(playerY - centerY) < tolerance;

        // Turn Logic
        if (this.currentDirection === Direction.NONE || (this.queuedDirection !== Direction.NONE && this.queuedDirection !== this.currentDirection)) {
            const canTurn = (this.currentDirection === Direction.NONE) || ((this.currentDirection === Direction.UP || this.currentDirection === Direction.DOWN) ? isCenteredX : isCenteredY);
            if (canTurn) {
                let nextCenterX = centerX;
                let nextCenterY = centerY;
                if (this.queuedDirection === Direction.LEFT) { nextCenterX -= this.tileSize; } 
                else if (this.queuedDirection === Direction.RIGHT) { nextCenterX += this.tileSize; } 
                else if (this.queuedDirection === Direction.UP) { nextCenterY -= this.tileSize; } 
                else if (this.queuedDirection === Direction.DOWN) { nextCenterY += this.tileSize; }

                // --- THIS IS THE CRUCIAL FIX ---
                // We must check if the path is clear before committing to the turn.
                if (this.isPathClear(nextCenterX, nextCenterY)) {
                    if (this.currentDirection === Direction.UP || this.currentDirection === Direction.DOWN) { this.player.x = centerX; } 
                    else if (this.currentDirection === Direction.LEFT || this.currentDirection === Direction.RIGHT) { this.player.y = centerY; }
                    this.currentDirection = this.queuedDirection;
                }
            }
        }
        
        // Proportional Snapping Logic (This is correct)
        body.setVelocity(0);
        switch (this.currentDirection) {
            case Direction.LEFT: body.setVelocityX(-this.speed); break;
            case Direction.RIGHT: body.setVelocityX(this.speed); break;
            case Direction.UP: body.setVelocityY(-this.speed); break;
            case Direction.DOWN: body.setVelocityY(this.speed); break;
        }
        
        const correctionFactor = 0.1;
        if (this.currentDirection === Direction.UP || this.currentDirection === Direction.DOWN) {
            const deltaX = centerX - this.player.x;
            if (Math.abs(deltaX) > 0.5) {
                body.velocity.x = deltaX * correctionFactor * this.speed;
            }
        }
        else if (this.currentDirection === Direction.LEFT || this.currentDirection === Direction.RIGHT) {
            const deltaY = centerY - this.player.y;
            if (Math.abs(deltaY) > 0.5) {
                body.velocity.y = deltaY * correctionFactor * this.speed;
            }
        }

        // Deadlock Fix (This is correct)
        if (body.velocity.x === 0 && body.velocity.y === 0) {
            if (body.blocked.up || body.blocked.down || body.blocked.left || body.blocked.right) {
                this.currentDirection = Direction.NONE;
            }
        }

        // Animation and Sprite Flipping (This is correct)
        this.player.setFlipX(this.currentDirection === Direction.LEFT);
        if (this.currentDirection !== Direction.NONE) {
            this.player.anims.play('walk', true);
        } else {
            this.player.anims.stop();
            this.player.setFrame(0);
        }
    }

    private handleLevelComplete() {
        const level = this.registry.get('startLevel') ?? 1;
        this.game.events.emit('level-complete', {
            score: this.score,
            level,
        });
    }
}
