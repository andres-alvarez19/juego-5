import { Scene } from 'phaser';
import type { GameLike, Enemy, Door, Waypoint } from '../logic/types';
import { EnemyState } from '../logic/types';
import {
    loadLevel as loadLevelImpl,
    buildStaticCollidersFromLayer as buildStaticCollidersFromLayerImpl,
    setupDoorsFromLayer as setupDoorsFromLayerImpl,
} from '../logic/level';
import { createAnimations as createAnimationsImpl } from '../logic/animations';
import { updatePlayerMovement as updatePlayerMovementImpl } from '../logic/movement';
import { updateEnemiesAI as updateEnemiesAIImpl } from '../logic/enemyAI';
import {
    spawnHeroFromLayer as spawnHeroFromLayerImpl,
    spawnCoinsFromLayer as spawnCoinsFromLayerImpl,
    spawnSpearsFromLayer as spawnSpearsFromLayerImpl,
    spawnEnemiesFromLayer as spawnEnemiesFromLayerImpl,
    loadWaypointsForPath as loadWaypointsForPathImpl,
    setupCameraFollow as setupCameraFollowImpl
} from '../spawns/spawns';
import { setupCollisions as setupCollisionsImpl } from '../collisions/collisions';

export class Game extends Scene implements GameLike {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    
    // World dimensions
    worldWidth: number = 1587;
    worldHeight: number = 1049;
    
    // Game objects
    hero!: Phaser.Physics.Matter.Sprite;
    enemies: Enemy[] = [];
    coins: Phaser.Physics.Matter.Sprite[] = [];
    bigCoins: Phaser.Physics.Matter.Sprite[] = [];
    spears: Phaser.Physics.Matter.Sprite[] = [];
    doors: Door[] = [];
    
    // Map and tilemap
    tilemap!: Phaser.Tilemaps.Tilemap;
    
    // Player controls
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    
    // Game state
    goldCollected: number = 0;
    score: number = 0;
    lives: number = 3;
    currentLevel: number = 1;
    gameMode: string = 'campaign';
    levelComplete: boolean = false;
    lastTeleportTime: number = 0;  // Cooldown para evitar teletransporte infinito
    isPaused: boolean = false;
    
    // Power-up state
    isInvincible: boolean = false;
    invincibilityEndTime: number = 0;
    
    // Damage invulnerability (after enemy hits)
    damageInvulnerableUntil: number = 0;

    constructor() {
        super('Game');
    }

    create() {
        // Get game configuration from registry (set by Vue)
        this.gameMode = this.registry.get('gameMode') || 'campaign';
        this.currentLevel = this.registry.get('startLevel') || 1;
        
        console.log('[Game Scene] Starting with mode:', this.gameMode, 'level:', this.currentLevel);
        
        this.camera = this.cameras.main;
        
        // Load the appropriate level
        this.loadLevel(this.currentLevel);
    }

    loadLevel(level: number) {
        loadLevelImpl(this, level);

        this.spawnHeroFromLayer('hero');
        this.spawnCoinsFromLayer('coins', 'big_coins');
        this.spawnSpearsFromLayer('spears');
        this.spawnEnemiesFromLayer('enemies', {
            patrolLayers: ['patrol', 'patrol_2', 'patrol_3', 'patrol_4', 'patrol_5', 'patrol_6']
        }, EnemyState);

        // Make EnemyState available to helper modules that respawn enemies
        this.registry.set('EnemyState', EnemyState);

        setupCameraFollowImpl(this, this.hero);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
        
        createAnimationsImpl(this);
        setupCollisionsImpl(this, this.enemies);
    }

    checkLevelComplete() {
        // Level is complete when all coins are collected
        if (this.coins.length === 0 && this.bigCoins.length === 0 && !this.levelComplete) {
            this.levelComplete = true;
            this.handleLevelComplete();
        }
    }

    handleLevelComplete() {
        // Emit level complete event to Vue
        this.game.events.emit('level-complete', {
            score: this.score,
            level: this.currentLevel,
        });
        
        // If in campaign mode and there's a next level, Vue will handle it
        // If in single level mode, Vue will return to menu
    }

    handlePlayerDeath() {
        // Emit game over event to Vue with final score
        this.game.events.emit('game-over', {
            score: this.score,
            level: this.currentLevel,
        });

        // Reset score, gold and lives for the next run
        this.score = 0;
        this.goldCollected = 0;
        this.lives = 3;
        this.isInvincible = false;
        this.invincibilityEndTime = 0;
        this.damageInvulnerableUntil = 0;

        this.emitUIUpdate();
    }

    emitUIUpdate() {
        // Emit score and lives updates to Vue UI
        this.game.events.emit('score-update', this.score);
        this.game.events.emit('lives-update', this.lives);
    }

    buildStaticCollidersFromLayer(layerName: string) {
        return buildStaticCollidersFromLayerImpl(this, layerName);
    }

    setupDoorsFromLayer(layerName: string) {
        return setupDoorsFromLayerImpl(this, layerName);
    }

    spawnHeroFromLayer(layerName: string) {
        return spawnHeroFromLayerImpl(this, layerName);
    }

    spawnCoinsFromLayer(coinLayerName: string, bigCoinLayerName: string) {
        return spawnCoinsFromLayerImpl(this, coinLayerName, bigCoinLayerName);
    }

    spawnSpearsFromLayer(layerName: string) {
        return spawnSpearsFromLayerImpl(this, layerName);
    }

    spawnEnemiesFromLayer(layerName: string, options: { patrolLayers: string[] }) {
        return spawnEnemiesFromLayerImpl(this, layerName, options, EnemyState);
    }

    loadWaypointsForPath(pathId: string | number, _patrolLayers: string[]): Waypoint[] {
        return loadWaypointsForPathImpl(this, pathId, _patrolLayers);
    }
    
    setupCameraFollow(target: Phaser.Physics.Matter.Sprite) {
        this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.camera.startFollow(target, true, 0.1, 0.1);
    }
    
    createAnimations() {
        return createAnimationsImpl(this);
    }

    setupCollisions() {
        return setupCollisionsImpl(this, this.enemies);
    }

    update(_time: number, delta: number) {
        if (!this.hero || this.isPaused) return;
        
        // Check if invincibility from spear has expired
        if (this.isInvincible && this.time.now >= this.invincibilityEndTime) {
            this.isInvincible = false;
            this.hero.clearTint();
        }
        
        // Player can always move
        updatePlayerMovementImpl(this);
        
        // Update AI for enemies that are not frozen
        updateEnemiesAIImpl(this, delta);
    }
}
