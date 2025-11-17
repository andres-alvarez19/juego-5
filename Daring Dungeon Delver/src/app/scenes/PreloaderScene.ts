import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        console.log('Loading assets...');

        // Determine which Pacman-style level to load.
        // This value is injected via the GameConfig callbacks.preBoot in src/game/config.ts.
        const level = this.registry.get('startLevel') ?? 1;
        const mapKey = 'map';
        const mapPath = `assets/level${level}.tmj`;

        // 1. Load the Tileset Images and the level tilemap.
        // The first key ('grass', 'wall', etc.) is what we'll use in our code.
        // The second key ('TX tileset Grass', etc.) MUST match the 'name' in the Tiled editor.
        this.load.tilemapTiledJSON(mapKey, mapPath);
        this.load.image('grass', 'assets/TX tileset Grass.png');
        this.load.image('wall', 'assets/TX tileset wall.png');
        this.load.image('stone_ground', 'assets/TX tileset stone ground.png');
        this.load.image('props', 'assets/tx tileset props.png');
        this.load.image('struct', 'assets/tx struct.png');

        this.load.image('coin_hd','assets/coin_hd.png');

        // 2. Load the Player Spritesheet
        // Key: 'player_walk', path, and frame dimensions
        this.load.spritesheet('player_walk', 'assets/alder-walk.png', {
            frameWidth: 100,
            frameHeight: 100
        });
    }

    create() {
        console.log('Assets loaded.');
        // When loading is complete, switch to the GameScene
        this.scene.start('GameScene');
    }
}
