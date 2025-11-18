<template>
  <div v-if="visible" :class="$style.gameOver">
    <div :class="$style.frameParent">
      <div :class="$style.botonesDeMenuParent">
        <div :class="$style.botonesDeMenu" @click="onRetry">
          <div :class="$style.botonSalir">
            <div :class="$style.botonSalirChild" />
            <div :class="$style.salir">Reintentar</div>
          </div>
        </div>
        <div :class="$style.botonesDeMenu" @click="onReturnToMenu">
          <div :class="$style.botonSalir">
            <div :class="$style.botonSalirChild" />
            <div :class="$style.salir">Volver al Menu</div>
          </div>
        </div>
      </div>
      <div :class="$style.gameOver2">Game Over</div>
      <div :class="$style.seleccionarNivelParent">
        <div :class="$style.seleccionarNivel">Puntaje Final:</div>
        <div :class="$style.gameOverSeleccionarNivel">{{ finalScore }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const finalScore = ref(0);

const emit = defineEmits<{
  retry: [];
  returnToMenu: [];
}>();

function onRetry() {
  visible.value = false;
  emit('retry');
}

function onReturnToMenu() {
  visible.value = false;
  emit('returnToMenu');
}

function show(score: number) {
  finalScore.value = score;
  visible.value = true;
}

function hide() {
  visible.value = false;
}

// Expose methods
defineExpose({
  show,
  hide,
});
</script>

<style module>
.gameOver {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
  text-align: center;
  font-size: 40px;
  color: #f4d500;
  font-family: 'MedievalSharp', serif;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.frameParent {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.botonesDeMenuParent {
  width: 100%;
  max-width: 860px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.botonesDeMenu {
  width: min(408px, 90vw);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.botonesDeMenu:hover {
  transform: scale(1.05);
}

.botonSalir {
  align-self: stretch;
  position: relative;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.botonSalirChild {
  position: absolute;
  inset: 6px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: auto;
  height: auto;
  opacity: 0.7;
}

.salir {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 1.5rem;
  text-align: center;
}

.gameOver2 {
  font-size: clamp(80px, 12vw, 200px);
  color: #dc2626;
  white-space: normal;
}

.seleccionarNivelParent {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 11px;
  font-size: clamp(28px, 5vw, 64px);
  color: #fff;
}

.seleccionarNivel {
  position: relative;
}

.gameOverSeleccionarNivel {
  position: relative;
  color: #f4d500;
}

@media (max-width: 768px) {
  .gameOver2 {
    font-size: clamp(60px, 11vw, 100px);
  }

  .seleccionarNivelParent {
    font-size: clamp(24px, 5vw, 40px);
  }

  .botonesDeMenuParent {
    flex-direction: column;
  }

  .botonesDeMenu {
    width: min(300px, 90vw);
  }

  .botonSalirChild {
    inset: 6px;
  }

  .salir {
    font-size: clamp(20px, 4.5vw, 32px);
  }
}

@media (max-width: 480px) {
  .frameParent {
    padding: 1.5rem 0.75rem;
    gap: 1.5rem;
  }

  .botonesDeMenuParent {
    gap: 12px;
  }

  .botonesDeMenu {
    width: 100%;
  }
}
</style>
