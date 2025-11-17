// Standalone entry to run the Pacman-style level 1 engine without Vue.
// The core configuration and scenes are shared with the main DDD integration
// via src/game/config.ts, so we just delegate to StartGame here.

import StartGame from '../game/config';

const game = StartGame('game-container', 'single-level', 1);
export default game;
