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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.botonesDeMenuParent {
  position: absolute;
  top: 670px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.botonesDeMenu {
  width: 408px;
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
  height: 128px;
  position: relative;
}

.botonSalirChild {
  position: absolute;
  top: 10px;
  left: 10px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  width: 388px;
  height: 108px;
  opacity: 0.7;
}

.salir {
  position: absolute;
  top: calc(50% - 54px);
  left: calc(50% - 194px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 388px;
  height: 108px;
}

.gameOver2 {
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 200px;
  color: #dc2626;
  white-space: nowrap;
}

.seleccionarNivelParent {
  position: absolute;
  top: 450px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 64px;
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
    font-size: 100px;
    top: 150px;
  }

  .seleccionarNivelParent {
    font-size: 40px;
    top: 350px;
  }

  .botonesDeMenuParent {
    top: 500px;
    flex-direction: column;
  }

  .botonesDeMenu {
    width: 300px;
  }

  .botonSalirChild {
    width: 280px;
  }

  .salir {
    width: 280px;
    font-size: 32px;
  }
}
</style>
