import { defineStore } from 'pinia';

export type GameMode = 'campaign' | 'single-level';

interface GameState {
  mode: GameMode;
  currentLevel: number;
  maxLevel: number;
  isPlaying: boolean;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    mode: 'campaign',
    currentLevel: 1,
    maxLevel: 5,
    isPlaying: false,
  }),

  actions: {
    startCampaign() {
      this.mode = 'campaign';
      this.currentLevel = 2; // Campaña empieza en nivel 2
      this.isPlaying = true;
    },

    startLevel(level: number) {
      this.mode = 'single-level';
      this.currentLevel = level;
      this.isPlaying = true;
    },

    nextLevel() {
      if (this.mode === 'campaign' && this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        return true;
      }
      return false;
    },

    completeLevel() {
      if (this.mode === 'campaign') {
        return this.nextLevel();
      } else {
        // Single level mode - return to menu
        this.isPlaying = false;
        return false;
      }
    },

    resetGame() {
      this.currentLevel = 1;
      this.isPlaying = false;
    },

    endGame() {
      this.isPlaying = false;
    },
  },

  getters: {
    isCampaignMode: (state) => state.mode === 'campaign',
    isSingleLevelMode: (state) => state.mode === 'single-level',
    isLastLevel: (state) => state.currentLevel >= state.maxLevel,
  },
});
