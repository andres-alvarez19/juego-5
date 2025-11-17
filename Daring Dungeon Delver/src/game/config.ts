import { AUTO, Game as PhaserGame } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Game as MainGame } from './scenes/Game';
import PreloaderScene from '../app/scenes/PreloaderScene';
import GameScene from '../app/scenes/GameScene';

/**
 * Phaser Game Configuration for Daring Dungeon Delver
 */
// Matter.js based configuration (levels 2–5)
const matterConfig: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: [Preloader, MainGame],
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
};

// Arcade-based configuration (Pacman-style level 1)
function createArcadeConfig(parent: string, startLevel: number): Phaser.Types.Core.GameConfig {
  return {
    type: AUTO,
    width: 960,
    height: 960,
    parent,
    backgroundColor: '#000000',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: true,
      },
    },
    scene: [
      PreloaderScene,
      GameScene,
    ],
    callbacks: {
      // Ensure registry has the level before any scene boots
      preBoot: (game: PhaserGame) => {
        game.registry.set('startLevel', startLevel);
      },
    },
  };
}

/**
 * Initialize and start the Phaser game
 * @param parent - The ID of the parent DOM element
 * @param gameMode - The game mode ('campaign' or 'single-level')
 * @param startLevel - The level to start from
 */
const StartGame = (parent: string, gameMode: string = 'campaign', startLevel: number = 1): PhaserGame => {
  // Level 1 uses the Pacman-style arcade engine (GameScene.ts)
  if (startLevel === 1) {
    const arcadeConfig = createArcadeConfig(parent, startLevel);
    const game = new PhaserGame(arcadeConfig);
    // GameScene uses registry.startLevel for reporting level-complete
    game.registry.set('gameMode', gameMode);
    return game;
  }

  // Levels 2–5 use the Matter.js Daring Dungeon Delver engine
  const game = new PhaserGame({ ...matterConfig, parent });

  // Set initial registry values before scenes start (used by Game.ts)
  game.registry.set('gameMode', gameMode);
  game.registry.set('startLevel', startLevel);

  return game;
};

export default StartGame;
