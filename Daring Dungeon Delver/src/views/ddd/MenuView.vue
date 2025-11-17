<template>
  <div :class="$style.startScreen">
    <img :class="$style.dungeonBackground" src="/assets/backgrounds/main_menu.png" alt="Dungeon Background" />

    <!-- Auth modal -->
    <div v-if="showAuthModal" :class="$style.authOverlay">
      <div :class="$style.authModal">
        <div :class="$style.authTitle">No autorizado</div>
        <div :class="$style.authMessage">
          El token de autenticación no es válido o ha expirado.
        </div>
        <div :class="$style.authMessage">
          Por favor vuelve a iniciar el juego desde UfroGameLab.
        </div>
      </div>
    </div>

    <div :class="$style.botonesDeMenuParent">
      <div :class="$style.daringDungeonDelver">Daring Dungeon Delver</div>
      <div :class="$style.botonesDeMenu">
        <div :class="$style.botonJugarCampaa" @click="startGame">
          <div :class="$style.roundedRectangle" />
          <div :class="$style.jugarCampaa">Jugar campaña</div>
        </div>
        <div :class="$style.botonSeleccionarNivel" @click="selectLevel">
          <div :class="$style.botonSeleccionarNivelChild" />
          <div :class="$style.seleccionarNivel">Seleccionar nivel</div>
        </div>
        <div :class="$style.botonVerPuntajes" @click="viewScores">
          <div :class="$style.botonVerPuntajesChild" />
          <div :class="$style.seleccionarNivel">Ver puntajes</div>
        </div>
        <div :class="$style.botonSalir" @click="handleExit">
          <div :class="$style.botonVerPuntajesChild" />
          <div :class="$style.seleccionarNivel">Salir</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { exitGameWithConfirmation } from '@/utils/exitGame';
import { useGameStore } from '@/stores/gameStore';
import { authProvider } from '@/services/AuthProvider';
import { createApiClient } from '@/integration/ApiClient';
import { LaunchInfoService } from '@/integration/LaunchInfoService';
import { resolveNumericGameId } from '@/integration/config';

const router = useRouter();
const gameStore = useGameStore();
const showAuthModal = ref(false);

onMounted(async () => {
  try {
    const gameId = resolveNumericGameId();
    if (!gameId) {
      showAuthModal.value = true;
      return;
    }

    const apiClient = createApiClient({
      getToken: () => authProvider.getToken(),
    });
    const launchInfoService = new LaunchInfoService(apiClient);
    const isValid = await launchInfoService.validateSession(gameId);

    if (!isValid) {
      showAuthModal.value = true;
    }
  } catch (error) {
    console.error('Failed to validate user session:', error);
    showAuthModal.value = true;
  }
});

function ensureAuthorized(): boolean {
  return !showAuthModal.value;
}

function startGame() {
  if (!ensureAuthorized()) return;
  gameStore.startCampaign();
  router.push('/ddd/play');
}

function selectLevel() {
  if (!ensureAuthorized()) return;
  router.push('/ddd/level-selector');
}

function viewScores() {
  if (!ensureAuthorized()) return;
  router.push('/ddd/scores');
}

function handleExit() {
  exitGameWithConfirmation();
}
</script>

<style module>
.startScreen {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #0d0b0b;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: center;
  font-size: clamp(24px, 2.5vw, 40px);
  color: #f4d500;
  font-family: 'MedievalSharp', serif;
}

.dungeonBackground {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
  opacity: 0.5;
  z-index: 0;
}

.authOverlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 10;
}

.authModal {
  max-width: 640px;
  margin: 1rem;
  padding: 2rem;
  border-radius: 16px;
  background-color: #111827;
  color: #f9fafb;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.authTitle {
  font-size: 40px;
  margin-bottom: 1rem;
  color: #fbbf24;
  font-family: 'MedievalSharp', serif;
}

.authMessage {
  font-size: 20px;
  margin-bottom: 0.5rem;
}

.botonesDeMenuParent {
  position: relative;
  width: 100%;
  max-width: 1587px;
  margin: 0 auto;
  min-height: 100vh;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 1rem;
}

.botonesDeMenu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 0;
  width: 100%;
  max-width: 450px;
}

.botonJugarCampaa {
  width: min(390px, 80vw);
  height: clamp(72px, 12vh, 108px);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.botonJugarCampaa:hover,
.botonSeleccionarNivel:hover,
.botonVerPuntajes:hover,
.botonSalir:hover {
  transform: scale(1.05);
}

.roundedRectangle {
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.botonJugarCampaa:hover .roundedRectangle,
.botonSeleccionarNivel:hover .botonSeleccionarNivelChild,
.botonVerPuntajes:hover .botonVerPuntajesChild,
.botonSalir:hover .botonVerPuntajesChild {
  opacity: 0.8;
  border-color: #ffff00;
}

.jugarCampaa {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.botonSeleccionarNivel {
  width: min(395px, 80vw);
  height: clamp(72px, 12vh, 108px);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.botonSeleccionarNivelChild {
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.seleccionarNivel {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.botonVerPuntajes {
  width: min(408px, 80vw);
  height: clamp(72px, 12vh, 108px);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.botonVerPuntajesChild {
  position: absolute;
  top: 0;
  left: 10px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: calc(100% - 22px);
  height: 100%;
  opacity: 0.7;
}

.botonSalir {
  width: min(408px, 80vw);
  height: clamp(72px, 12vh, 108px);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.daringDungeonDelver {
  position: relative;
  font-size: clamp(32px, 6vw, 100px);
  color: #d5c400;
  width: 100%;
  max-width: 1200px;
  text-align: center;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  padding: 1rem;
  margin-bottom: 3rem;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .daringDungeonDelver {
    font-size: clamp(48px, 8vw, 134px);
    margin-bottom: 4rem;
  }

  .botonesDeMenu {
    gap: 42px;
  }
}

@media (max-width: 767px) {
  .botonesDeMenuParent {
    padding: 1.5rem 1rem;
  }

  .daringDungeonDelver {
    margin-bottom: 2rem;
    padding: 0.5rem;
  }

  .botonesDeMenu {
    gap: 20px;
    max-width: 100%;
    padding: 0 1rem;
  }

  .botonJugarCampaa,
  .botonSeleccionarNivel {
    width: min(320px, 100%);
    height: 90px;
  }

  .botonVerPuntajes,
  .botonSalir {
    width: min(340px, 100%);
    height: 90px;
  }

  .botonVerPuntajesChild {
    top: 0;
    left: 5px;
    width: calc(100% - 10px);
  }

  .seleccionarNivel,
  .jugarCampaa {
    font-size: clamp(24px, 5vw, 32px);
    padding: 0 1rem;
  }

  .roundedRectangle,
  .botonSeleccionarNivelChild {
    width: 100%;
  }

  .seleccionarNivel {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .daringDungeonDelver {
    font-size: clamp(24px, 8vw, 48px);
    margin-bottom: 1.5rem;
  }

  .botonJugarCampaa,
  .botonSeleccionarNivel,
  .botonVerPuntajes,
  .botonSalir {
    width: 100%;
    max-width: 280px;
    height: 80px;
  }

  .seleccionarNivel,
  .jugarCampaa {
    font-size: clamp(20px, 5vw, 28px);
  }

  .botonVerPuntajesChild {
    left: 0;
    width: 100%;
  }
}
</style>
