<template>
  <div :class="$style.puntajes">
    <img :class="$style.dungeonBackground" src="/assets/backgrounds/main_menu.png" alt="Dungeon Background" />
    
    <div :class="$style.puntajes2">Puntajes</div>
    
    <div :class="$style.boton" @click="backToMenu">
      <div :class="$style.salir">← Volver</div>
    </div>
    
    <div :class="$style.puntajesBoton" @click="showLeaderboard">
      <div :class="$style.puntajesSalir">Mejores Puntajes</div>
    </div>
    
    <div :class="$style.frameParent">
      <!-- Puntajes por campaña -->
      <div :class="$style.puntajesPorCampaaParent">
        <div :class="$style.puntajesPorCampaa">Puntajes por campaña</div>
        <div :class="$style.botonSalir">
          <div :class="$style.botonSeleccionarNivel">
            <div :class="$style.seleccionarNivel">Nombre</div>
            <div :class="$style.seleccionarNivel">Puntaje</div>
            <div :class="$style.seleccionarNivel">Fecha</div>
          </div>
          
          <div 
            v-for="(score, index) in campaignScores" 
            :key="index"
            :class="$style[getRowClass(index)]"
          >
            <div :class="$style.seleccionarNivel">{{ score.name }}</div>
            <div :class="$style.seleccionarNivel4">{{ score.score }}</div>
            <div :class="$style.seleccionarNivel">{{ score.date }}</div>
          </div>
        </div>
      </div>

      <!-- Últimos puntajes del jugador (local) -->
      <div :class="$style.puntajesPorCampaaParent">
        <div :class="$style.puntajesPorCampaa">Últimos puntajes</div>
        <div :class="$style.puntajesBotonSalir">
          <div :class="$style.botonSeleccionarNivel">
            <div :class="$style.seleccionarNivel">Modo / Nivel</div>
            <div :class="$style.seleccionarNivel">Puntaje</div>
            <div :class="$style.seleccionarNivel">Fecha</div>
          </div>
          
          <div 
            v-for="(score, index) in levelScores" 
            :key="index"
            :class="$style[getLevelRowClass(index)]"
          >
            <div :class="$style.seleccionarNivel">{{ score.label }}</div>
            <div :class="$style.seleccionarNivel4">{{ score.score }}</div>
            <div :class="$style.seleccionarNivel">{{ score.date }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScoreStore } from '@/stores/scoreStore';
import { resolveNumericGameId } from '@/integration/config';

const router = useRouter();
const scoreStore = useScoreStore();

const campaignScores = computed(() => {
  const scores = scoreStore.bestScores.filter((s) => s.mode === 'campaign');
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  return sorted.slice(0, 5).map((s) => ({
    name: s.user_name,
    score: s.score,
    date: new Date(s.created_at).toLocaleDateString(),
  }));
});

const levelScores = computed(() => {
  const scores = [...scoreStore.recentScores];
  const sorted = scores.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sorted.slice(0, 5).map((s) => ({
    label: s.mode === 'campaign' ? 'Campaña' : `Nivel ${s.level}`,
    score: s.score,
    date: new Date(s.date).toLocaleDateString(),
  }));
});

function getRowClass(index: number): string {
  const classes = [
    'puntajesBotonSeleccionarNivel',
    'botonSeleccionarNivel2',
    'botonSeleccionarNivel3',
    'botonSeleccionarNivel4',
    'botonSeleccionarNivel5',
    'botonSeleccionarNivel6'
  ];
  return classes[index] || 'botonSeleccionarNivel6';
}

function getLevelRowClass(index: number): string {
  const classes = [
    'botonSeleccionarNivel8',
    'botonSeleccionarNivel12',
    'botonSeleccionarNivel9',
    'botonSeleccionarNivel11',
    'botonSeleccionarNivel10'
  ];
  return classes[index] || 'botonSeleccionarNivel10';
}

function backToMenu() {
  router.push('/ddd');
}

function getGameIdForRequests(): string {
  const numericId = resolveNumericGameId();
  if (numericId && Number.isFinite(numericId)) {
    return String(numericId);
  }
  return import.meta.env.VITE_GAME_ID || 'ddd';
}

function showLeaderboard() {
  // Cargar mejores puntajes globales
  const gameId = getGameIdForRequests();
  scoreStore.fetchLeaderboard(gameId, 10).catch((error) => {
    console.error('Failed to load leaderboard:', error);
  });
}

onMounted(() => {
  const gameId = getGameIdForRequests();
  // Cargar leaderboard general
  scoreStore.fetchLeaderboard(gameId, 10).catch((error) => {
    console.error('Failed to load leaderboard:', error);
  });
});
</script>

<style module>
.puntajes {
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  position: relative;
  background-color: #090f11;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: center;
  font-size: clamp(24px, 2.5vw, 40px);
  color: #d5c400;
  font-family: 'MedievalSharp', serif;
  padding-bottom: 2rem;
}

.dungeonBackground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  z-index: 0;
}

.puntajes2 {
  position: relative;
  margin-top: 30px;
  font-size: clamp(48px, 8vw, 96px);
  color: #d5c400;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  z-index: 1;
  margin-bottom: 2rem;
}

.boton {
  position: absolute;
  top: 208px;
  left: 83px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 222px;
  height: 77px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  cursor: pointer;
  color: #f4d500;
  z-index: 1;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.boton:hover {
  transform: scale(1.05);
  border-color: #ffff00;
}

.salir {
  font-size: 40px;
  color: #f4d500;
}

.puntajesBoton {
  position: absolute;
  top: 209px;
  right: 83px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #a77307;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 383px;
  height: 77px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  cursor: pointer;
  color: #fff;
  z-index: 1;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.puntajesBoton:hover {
  transform: scale(1.05);
  background-color: #c98808;
}

.puntajesSalir {
  font-size: 40px;
  color: #fff;
}

.frameParent {
  position: relative;
  width: 100%;
  max-width: 1402px;
  margin: 318px auto 0;
  padding: 0 20px;
  overflow-y: visible;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 91px;
  text-align: left;
  font-family: 'Cinzel', serif;
  z-index: 1;
}

.puntajesPorCampaaParent {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.puntajesPorCampaa {
  align-self: stretch;
  position: relative;
  font-weight: 900;
  font-size: clamp(24px, 2.5vw, 40px);
  color: #d5c400;
  font-family: 'MedievalSharp', serif;
}

.botonSalir {
  align-self: stretch;
  position: relative;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #231f1d;
  border: 2px solid #fff;
  box-sizing: border-box;
  text-align: center;
  color: #fff;
  font-family: 'MedievalSharp', serif;
}

.puntajesBotonSalir {
  align-self: stretch;
  position: relative;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #231f1d;
  border: 2px solid #fff;
  box-sizing: border-box;
  text-align: center;
  color: #fff;
  font-family: 'MedievalSharp', serif;
}

.botonSeleccionarNivel {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px 20px 0px 0px;
  background-color: #1d1a17;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 100%;
  height: 87px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 6px 25px;
  font-size: clamp(18px, 2vw, 32px);
}

.seleccionarNivel {
  position: relative;
  flex: 1;
  text-align: center;
}

.seleccionarNivel4 {
  position: relative;
  color: #f4d500;
  flex: 1;
  text-align: center;
}

.puntajesBotonSeleccionarNivel,
.botonSeleccionarNivel2,
.botonSeleccionarNivel3,
.botonSeleccionarNivel4,
.botonSeleccionarNivel5,
.botonSeleccionarNivel6,
.botonSeleccionarNivel8,
.botonSeleccionarNivel9,
.botonSeleccionarNivel10,
.botonSeleccionarNivel11,
.botonSeleccionarNivel12 {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  background-color: #231f1d;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 100%;
  height: clamp(60px, 8vh, 87px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 6px 25px;
  font-size: 40px;
}

.botonSeleccionarNivel6,
.botonSeleccionarNivel10 {
  border-radius: 0px 0px 20px 20px;
}

/* Responsive Styles */
@media (max-width: 1440px) {
  .boton,
  .puntajesBoton {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin: 1rem auto;
    width: 90%;
    max-width: 360px;
  }

  .frameParent {
    margin-top: 2.5rem;
    padding: 0 40px;
  }
}

@media (max-width: 1024px) {
  .puntajes2 {
    font-size: clamp(40px, 6vw, 72px);
  }

  .boton,
  .puntajesBoton {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin: 1rem auto;
    width: 90%;
    max-width: 350px;
  }

  .frameParent {
    margin-top: 2rem;
    padding: 0 20px;
  }

  .botonSeleccionarNivel,
  .puntajesBotonSeleccionarNivel,
  .botonSeleccionarNivel2,
  .botonSeleccionarNivel3,
  .botonSeleccionarNivel4,
  .botonSeleccionarNivel5,
  .botonSeleccionarNivel6,
  .botonSeleccionarNivel8,
  .botonSeleccionarNivel9,
  .botonSeleccionarNivel10,
  .botonSeleccionarNivel11,
  .botonSeleccionarNivel12 {
    font-size: 32px;
    padding: 6px 15px;
  }

  .puntajesPorCampaa {
    font-size: 32px;
  }

  .salir,
  .puntajesSalir {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .puntajes2 {
    font-size: clamp(32px, 8vw, 56px);
    margin-top: 20px;
  }

  .frameParent {
    gap: 50px;
  }

  .botonSeleccionarNivel,
  .puntajesBotonSeleccionarNivel,
  .botonSeleccionarNivel2,
  .botonSeleccionarNivel3,
  .botonSeleccionarNivel4,
  .botonSeleccionarNivel5,
  .botonSeleccionarNivel6,
  .botonSeleccionarNivel8,
  .botonSeleccionarNivel9,
  .botonSeleccionarNivel10,
  .botonSeleccionarNivel11,
  .botonSeleccionarNivel12 {
    font-size: 24px;
    height: 70px;
    padding: 6px 10px;
  }

  .puntajesPorCampaa {
    font-size: 28px;
  }

  .salir,
  .puntajesSalir {
    font-size: 28px;
  }

  .boton,
  .puntajesBoton {
    height: 65px;
  }
}

@media (max-width: 480px) {
  .botonSeleccionarNivel,
  .puntajesBotonSeleccionarNivel,
  .botonSeleccionarNivel2,
  .botonSeleccionarNivel3,
  .botonSeleccionarNivel4,
  .botonSeleccionarNivel5,
  .botonSeleccionarNivel6,
  .botonSeleccionarNivel8,
  .botonSeleccionarNivel9,
  .botonSeleccionarNivel10,
  .botonSeleccionarNivel11,
  .botonSeleccionarNivel12 {
    font-size: 18px;
    height: 60px;
    flex-direction: column;
    padding: 4px 8px;
  }

  .seleccionarNivel,
  .seleccionarNivel4 {
    font-size: 16px;
  }

  .puntajesPorCampaa {
    font-size: 24px;
  }
}
</style>
