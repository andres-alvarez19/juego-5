<template>
  <div class="min-h-screen bg-surface-900">
    <div v-if="showAuthWarning" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Message severity="warn" :closable="false">
        <div class="flex items-center gap-4">
          <span>Authentication failed. Please log in to play.</span>
          <Button label="Go to Login" size="small" @click="goToLogin" />
        </div>
      </Message>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner />
    </div>

    <div v-else class="game-container">
      <!-- Game UI Overlay -->
      <div class="ui-overlay">
        <GameUI 
          :score="currentScore"
          :lives="currentLives"
          :time="elapsedTime"
          @pause="handlePauseClick"
        />
      </div>
      
      <div id="game-container"></div>
      <PauseMenu 
        ref="pauseMenuRef"
        @continue="handleContinue"
        @restart="handleRestart"
        @return-to-menu="handleReturnToMenu"
      />
      <GameOverMenu
        ref="gameOverMenuRef"
        @retry="handleRetryFromGameOver"
        @return-to-menu="handleReturnToMenuFromGameOver"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import PauseMenu from '@/components/PauseMenu.vue';
import GameOverMenu from '@/components/GameOverMenu.vue';
import GameUI from '@/components/GameUI.vue';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useScoreStore } from '@/stores/scoreStore';
import { useGameStore } from '@/stores/gameStore';
import { authProvider } from '@/services/AuthProvider';
import { getCurrentTimestamp } from '@/utils/formatTime';
import StartGame from '@/game/config';
import { createApiClient } from '@/integration/ApiClient';
import { SessionService } from '@/integration/SessionService';
import { SessionManager } from '@/runtime/SessionManager';
import { resolveNumericGameId } from '@/integration/config';

const router = useRouter();
const userStore = useUserStore();
const sessionStore = useSessionStore();
const scoreStore = useScoreStore();
const gameStore = useGameStore();

const isLoading = ref(true);
const showAuthWarning = ref(false);
const pauseMenuRef = ref<InstanceType<typeof PauseMenu> | null>(null);
const gameOverMenuRef = ref<InstanceType<typeof GameOverMenu> | null>(null);
let gameInstance: Phaser.Game | null = null;
let isPaused = false;

// Game UI state
const currentScore = ref(0);
const currentLives = ref(3);
const elapsedTime = ref(0);
let timerInterval: number | null = null;

// Session tracking for close-window behavior
let sessionManager: SessionManager | null = null;
let sessionManagerGameId: number | null = null;

function initSessionManagerIfPossible() {
  if (sessionManager) {
    return;
  }

  const parsedGameId = resolveNumericGameId();
  if (!parsedGameId) {
    return;
  }

  const apiClient = createApiClient({
    getToken: () => authProvider.getToken(),
  });
  const sessionService = new SessionService(apiClient);

  sessionManagerGameId = parsedGameId;
  sessionManager = new SessionManager(
    { session: sessionService },
    {
      getGameId: () => sessionManagerGameId,
      getAuthToken: () => authProvider.getToken(),
    }
  );
  sessionManager.start();
}

onMounted(async () => {
  try {
    // Start local session tracking
    sessionStore.startSession(crypto.randomUUID(), gameStore.mode, gameStore.currentLevel);

    // Initialize session manager for aggregated stats (highest score & total time)
    initSessionManagerIfPossible();

    // Initialize Phaser game
    isLoading.value = false;
    await initializeGame();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    showAuthWarning.value = true;
    isLoading.value = false;
  }
});

async function initializeGame() {
  // Wait for DOM to be ready
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Initialize Phaser game with game mode and level
  gameInstance = StartGame('game-container', gameStore.mode, gameStore.currentLevel);
  
  // Listen for game events
  if (gameInstance) {
    gameInstance.events.on('level-complete', handleLevelComplete);
    gameInstance.events.on('game-over', handleGameOver);
    
    // Listen for UI updates from Phaser
    gameInstance.events.on('score-update', (score: number) => {
      currentScore.value = score;
      // Track last score and campaign best score continuously
      scoreStore.pushScore(score, gameStore.isCampaignMode);

      if (sessionManager && gameStore.isCampaignMode) {
        sessionManager.setScore(score);
      }
    });
    
    gameInstance.events.on('lives-update', (lives: number) => {
      currentLives.value = lives;
    });
  }
  
  // Listen for pause/resume events
  window.addEventListener('game-pause', handlePause);
  window.addEventListener('game-resume', handleResume);
  
  // Start timer
  startTimer();
}

function startTimer() {
  elapsedTime.value = 0;
  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }
  timerInterval = window.setInterval(() => {
    if (!isPaused) {
      elapsedTime.value++;
      if (sessionManager) {
        sessionManager.addPlaytime(1);
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handlePauseClick() {
  if (!isPaused) {
    handlePause();
    // Open pause menu
    if (pauseMenuRef.value) {
      pauseMenuRef.value.show();
    }
  }
}

function handlePause() {
  if (gameInstance && !isPaused) {
    const mainSceneKey = getMainSceneKey();
    gameInstance.scene.pause(mainSceneKey);
    isPaused = true;
    
    // Show pause menu
    if (pauseMenuRef.value) {
      pauseMenuRef.value.show();
    }
  }
}

function handleResume() {
  if (gameInstance && isPaused) {
    const mainSceneKey = getMainSceneKey();
    gameInstance.scene.resume(mainSceneKey);
    isPaused = false;
  }
}

function handleContinue() {
  handleResume();
}

async function handleRestart() {
  if (gameInstance) {
    // Restart the current level
    const mainSceneKey = getMainSceneKey();
    const currentScene = gameInstance.scene.getScene(mainSceneKey);
    if (currentScene) {
      gameInstance.scene.stop('Game');
      gameInstance.scene.start('Game');
      isPaused = false;
    }
  }
}

async function handleReturnToMenu() {
  try {
    if (sessionStore.sessionId) {
      const duration = sessionStore.sessionDuration;
      const finalScore = scoreStore.lastScore || 0;

      // Registrar puntaje local también cuando se sale manualmente al menú
      scoreStore.recordLocalScore(finalScore, gameStore.mode, gameStore.currentLevel);
      
      // End session
      sessionStore.endSession();
      gameStore.endGame();
    }
    
    returnToMenu();
  } catch (error) {
    console.error('Failed to return to menu:', error);
    returnToMenu();
  }
}

async function handleLevelComplete(data: { score: number; level: number }) {
  try {
    const duration = sessionStore.sessionDuration;
    
    scoreStore.pushScore(data.score, gameStore.isCampaignMode);

    // Check if there's a next level
    const hasNextLevel = gameStore.completeLevel();
    
    if (hasNextLevel) {
      // Continue to next level in campaign mode
      console.log('[GameView] Advancing to next level:', gameStore.currentLevel);
      if (gameInstance) {
        // Update the level in the registry
        gameInstance.registry.set('startLevel', gameStore.currentLevel);
        
        // Restart the Game scene with the new level
        const mainSceneKey = getMainSceneKey();
        const gameScene = gameInstance.scene.getScene(mainSceneKey);
        if (gameScene) {
          gameInstance.scene.stop(mainSceneKey);
          gameInstance.scene.start(mainSceneKey);
        }
      }
    } else {
      // End game - either single level completed or campaign finished
      console.log('[GameView] Level/Campaign completed. Returning to menu.');
      await endGameSession(data.score);
      returnToMenu();
    }
  } catch (error) {
    console.error('Failed to handle level complete:', error);
  }
}

async function handleGameOver(data: { score: number; level: number }) {
  try {
    // Pause the game scene
    if (gameInstance) {
      const mainSceneKey = getMainSceneKey();
      gameInstance.scene.pause(mainSceneKey);
      isPaused = true;
    }

    // Stop the timer when the player loses
    stopTimer();
    
    // Show game over menu instead of immediately ending
    if (gameOverMenuRef.value) {
      gameOverMenuRef.value.show(data.score);
    }
  } catch (error) {
    console.error('Failed to handle game over:', error);
  }
}

async function handleRetryFromGameOver() {
  if (gameInstance) {
    // Restart the current level
    const mainSceneKey = getMainSceneKey();
    const currentScene = gameInstance.scene.getScene(mainSceneKey);
    if (currentScene) {
      gameInstance.scene.stop(mainSceneKey);
      gameInstance.scene.start(mainSceneKey);
      isPaused = false;
    }

    // Reset and restart the run timer
    startTimer();
  }
}

async function handleReturnToMenuFromGameOver() {
  try {
    const finalScore = scoreStore.lastScore || 0;
    await endGameSession(finalScore);
    returnToMenu();
  } catch (error) {
    console.error('Failed to return to menu from game over:', error);
    returnToMenu();
  }
}

async function endGameSession(finalScore: number) {
  try {
    const duration = sessionStore.sessionDuration;
    
    scoreStore.pushScore(finalScore, gameStore.isCampaignMode);
    scoreStore.recordLocalScore(finalScore, gameStore.mode, gameStore.currentLevel);
    sessionStore.endSession();
    gameStore.endGame();
  } catch (error) {
    console.error('Failed to end game session:', error);
  }
}

function returnToMenu() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
  router.push('/ddd');
}

function getMainSceneKey(): string {
  // Level 1 uses the arcade-based GameScene; levels 2–5 use the Matter-based Game scene.
  return gameStore.currentLevel === 1 ? 'GameScene' : 'Game';
}

function goToLogin() {
  // Navigate to login - this would be handled by the parent app
  router.push('/');
}

onUnmounted(() => {
  window.removeEventListener('game-pause', handlePause);
  window.removeEventListener('game-resume', handleResume);
  
  stopTimer();

  if (sessionManager) {
    sessionManager.stop();
    sessionManager = null;
    sessionManagerGameId = null;
  }
  
  if (gameInstance) {
    gameInstance.events.off('level-complete', handleLevelComplete);
    gameInstance.events.off('game-over', handleGameOver);
    gameInstance.destroy(true);
    gameInstance = null;
  }
});
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #000000;
}

.ui-overlay {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 100;
  width: auto;
  max-width: 750px;
  pointer-events: all;
}

#game-container {
  width: 100%;
  height: 100%;
}

#game-container canvas {
  display: block;
}
</style>
