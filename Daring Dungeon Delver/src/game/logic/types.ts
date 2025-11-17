import type { Scene } from 'phaser';

export enum EnemyState {
    PATROL = 'PATROL',
    CHASE = 'CHASE',
    SEARCH = 'SEARCH'
}

export interface Waypoint {
    x: number;
    y: number;
    order: number;
}

export interface Door {
    id: string;
    targetId: string;
    body: MatterJS.BodyType;
    x: number;
    y: number;
}

export interface Enemy {
    sprite: Phaser.Physics.Matter.Sprite;
    type: 'patrol' | 'seeker';
    state: EnemyState;
    pathId?: string;
    waypoints?: Waypoint[];
    currentWaypointIndex: number;
    waypointDirection: 1 | -1;
    chaseRadius: number;
    loseRadius: number;
    fov: number;
    speed: number;
    lastSeenX?: number;
    lastSeenY?: number;
    replanMs?: number;
    lastReplanTime?: number;
    originalX: number;
    originalY: number;
    isDead?: boolean;
}

export interface GameLike extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    worldWidth: number;
    worldHeight: number;
    hero: Phaser.Physics.Matter.Sprite;
    enemies: Enemy[];
    coins: Phaser.Physics.Matter.Sprite[];
    bigCoins: Phaser.Physics.Matter.Sprite[];
    spears: Phaser.Physics.Matter.Sprite[];
    doors: Door[];
    tilemap: Phaser.Tilemaps.Tilemap;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    goldCollected: number;
    score: number;
    lives: number;
    currentLevel: number;
    gameMode: string;
    levelComplete: boolean;
    lastTeleportTime: number;
    isPaused: boolean;
    isInvincible: boolean;
    invincibilityEndTime: number;
    // Tiempo (ms, scene.time.now) hasta el que el héroe es invulnerable tras recibir daño de un enemigo
    damageInvulnerableUntil: number;
}
