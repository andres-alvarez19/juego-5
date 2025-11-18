<template>
  <div v-if="visible" :class="$style.pause">
    <div :class="$style.pausaWrapper">
      <div :class="$style.pausa">Pausa</div>
    </div>
    <div :class="$style.pauseInner">
      <div :class="$style.frameParent">
        <div :class="$style.sword46141691Parent" @click="onContinue">
          <img 
            :class="$style.sword46141691Icon" 
            src="/assets/icons/sword.png" 
            alt="Continue" 
          />
          <div :class="$style.continuar">Continuar</div>
        </div>
        <div :class="$style.frameChild" />
        <div :class="$style.hourglass17031651Parent" @click="onRestart">
          <img 
            :class="$style.hourglass17031651Icon" 
            src="/assets/icons/hourglass.png" 
            alt="Restart" 
          />
          <div :class="$style.continuar">Reiniciar nivel</div>
        </div>
        <div :class="$style.frameChild" />
        <div :class="$style.door12300301Parent" @click="onReturnToMenu">
          <img 
            :class="$style.door12300301Icon" 
            src="/assets/icons/door.png" 
            alt="Return" 
          />
          <div :class="$style.continuar">Volver al menu</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(false);

const emit = defineEmits<{
  continue: [];
  restart: [];
  returnToMenu: [];
}>();

function onContinue() {
  visible.value = false;
  emit('continue');
}

function onRestart() {
  visible.value = false;
  emit('restart');
}

function onReturnToMenu() {
  visible.value = false;
  emit('returnToMenu');
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Escape' && !visible.value) {
    visible.value = true;
    // Emit event to pause game
    window.dispatchEvent(new CustomEvent('game-pause'));
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('show-pause-menu', () => {
    visible.value = true;
  });
  window.addEventListener('hide-pause-menu', () => {
    visible.value = false;
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

// Expose method to toggle visibility programmatically
defineExpose({
  show: () => {
    visible.value = true;
  },
  hide: () => {
    visible.value = false;
  },
  toggle: () => {
    visible.value = !visible.value;
  },
});
</script>

<style module>
.pause {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
  text-align: center;
  font-size: clamp(40px, 6vw, 96px);
  color: #fff;
  font-family: 'MedievalSharp', serif;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.pausaWrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.pausa {
  position: absolute;
  top: 5vh;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 1rem;
}

.pauseInner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 40px;
  border-radius: 20px;
  background-color: rgba(40, 43, 52, 0.64);
  border: 4px solid #4e4e56;
  box-sizing: border-box;
  width: min(979px, 90vw);
  height: auto;
  min-height: 320px;
  padding: 2.5rem 1.5rem;
  font-size: clamp(28px, 3vw, 48px);
}

.frameParent {
  width: 100%;
  max-width: 796px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.sword46141691Parent {
  width: min(579px, 100%);
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 117px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.sword46141691Parent:hover {
  transform: scale(1.05);
}

.sword46141691Icon {
  width: 77px;
  height: 77px;
  object-fit: contain;
}

.continuar {
  position: relative;
  padding: 0 0.75rem;
  white-space: normal;
}

.frameChild {
  width: min(568px, 90%);
  height: 5px;
  position: relative;
  backdrop-filter: blur(4px);
  border-radius: 20px;
  background-color: #474952;
}

.hourglass17031651Parent {
  align-self: stretch;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 84px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.hourglass17031651Parent:hover {
  transform: scale(1.05);
}

.hourglass17031651Icon {
  width: 79px;
  height: 79px;
  object-fit: contain;
}

.door12300301Parent {
  align-self: stretch;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.door12300301Parent:hover {
  transform: scale(1.05);
}

.door12300301Icon {
  width: 75px;
  height: 75px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .pause {
    font-size: clamp(32px, 6vw, 48px);
  }
  
  .pausa {
    top: 4vh;
    font-size: clamp(40px, 9vw, 64px);
  }
  
  .pauseInner {
    font-size: clamp(22px, 4vw, 32px);
    padding: 2rem 1.25rem;
    min-height: 260px;
  }
  
  .frameParent {
    gap: 20px;
  }
  
  .sword46141691Parent,
  .hourglass17031651Parent,
  .door12300301Parent {
    gap: 24px;
  }
  
  .sword46141691Icon,
  .hourglass17031651Icon,
  .door12300301Icon {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .pauseInner {
    padding: 1.5rem 1rem;
  }

  .frameParent {
    gap: 16px;
  }

  .sword46141691Parent,
  .hourglass17031651Parent,
  .door12300301Parent {
    flex-wrap: wrap;
    gap: 16px;
  }

  .sword46141691Icon,
  .hourglass17031651Icon,
  .door12300301Icon {
    width: 40px;
    height: 40px;
  }
}
</style>
