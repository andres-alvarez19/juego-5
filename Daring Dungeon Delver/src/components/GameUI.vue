<template>
  <div :class="$style.ui">
    <!-- Score Section -->
    <div :class="$style.scoreContainer">
      <img :class="$style.coinIcon" src="/assets/entities/rewards/normal coin.png" alt="Score" />
      <div :class="$style.scoreText">{{ score }}</div>
    </div>

    <!-- Hearts Section -->
    <div :class="$style.heartsContainer">
      <img 
        v-for="index in 3" 
        :key="index"
        :class="$style.heartIcon" 
        :src="getHeartIcon(index)" 
        alt="Heart" 
      />
    </div>

    <!-- Timer Section -->
    <div :class="$style.timerContainer">
      <img :class="$style.hourglassIcon" src="/assets/icons/hourglass_ui.png" alt="Timer" />
      <div :class="$style.timerText">{{ formattedTime }}</div>
    </div>

    <!-- Pause Button -->
    <div :class="$style.pauseButton" @click="onPauseButtonClick">
      <img :class="$style.pauseIcon" src="/assets/icons/pause_button.png" alt="Pause" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  score?: number;
  lives?: number;
  time?: number; // Time in seconds
}

const props = withDefaults(defineProps<Props>(), {
  score: 0,
  lives: 3,
  time: 0,
});

const emit = defineEmits<{
  pause: [];
}>();

const formattedTime = computed(() => {
  const minutes = Math.floor(props.time / 60);
  const seconds = props.time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const getHeartIcon = (index: number): string => {
  return index <= props.lives 
    ? '/assets/icons/full_heart.png' 
    : '/assets/icons/emty_heart.png';
};

function onPauseButtonClick() {
  emit('pause');
}
</script>

<style module>
.ui {
  width: 100%;
  max-width: 750px;
  height: 75px;
  position: relative;
  border-radius: 15px;
  background-color: #24232e;
  border: 5px solid #79503e;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 30px;
  gap: 25px;
  text-align: center;
  font-size: 38px;
  color: #fff;
  font-family: 'MedievalSharp', serif;
}

.scoreContainer {
  height: 50px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.coinIcon {
  width: 55px;
  height: 55px;
  position: relative;
  max-height: 100%;
  object-fit: contain;
}

.scoreText {
  position: relative;
  font-size: 38px;
}

.heartsContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 50px;
}

.heartIcon {
  width: 38px;
  height: 38px;
  position: relative;
  object-fit: contain;
}

.timerContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 50px;
}

.hourglassIcon {
  width: 42px;
  height: 42px;
  position: relative;
  max-height: 100%;
  object-fit: contain;
}

.timerText {
  position: relative;
  font-size: 32px;
}

.pauseButton {
  height: 50px;
  width: 52px;
  border-radius: 12px;
  background-color: #191724;
  border: 4px solid #79503e;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pauseButton:hover {
  background-color: #2a2634;
  transform: scale(1.05);
}

.pauseButton:active {
  transform: scale(0.95);
}

.pauseIcon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
