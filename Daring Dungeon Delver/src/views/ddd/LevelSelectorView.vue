<template>
  <div :class="$style.levelSelector">
    <img :class="$style.dungeonBackground" src="/assets/backgrounds/main_menu.png" alt="Dungeon Background" />
    <div :class="$style.botonesDeMenuParent">
      <div :class="$style.seleccionarNivel">Seleccionar Nivel</div>
      
      <div :class="$style.frameParent">
        <div :class="$style.levelCard" @click="selectLevel(1)">
          <div :class="$style.levelTitle">Nivel 1</div>
          <img :class="$style.levelMiniImage" src="/assets/backgrounds/1_level_mini_bg.png" alt="Nivel 1" />
          <div :class="$style.levelName">Las catacumbas</div>
          <div :class="$style.boton">
            <div :class="$style.botonText">Jugar</div>
          </div>
        </div>

        <div :class="$style.levelCard" @click="selectLevel(2)">
          <div :class="$style.levelTitle">Nivel 2</div>
          <img :class="$style.levelMiniImage" src="/assets/backgrounds/2_level_mini_bg.png" alt="Nivel 2" />
          <div :class="$style.levelName">Abismo Olvidado</div>
          <div :class="$style.boton">
            <div :class="$style.botonText">Jugar</div>
          </div>
        </div>

        <div :class="$style.levelCard" @click="selectLevel(3)">
          <div :class="$style.levelTitle">Nivel 3</div>
          <img :class="$style.levelMiniImage" src="/assets/backgrounds/3_level_mini_bg.png" alt="Nivel 3" />
          <div :class="$style.levelName">Forja Antigua</div>
          <div :class="$style.boton">
            <div :class="$style.botonText">Jugar</div>
          </div>
        </div>

        <div :class="$style.levelCard" @click="selectLevel(4)">
          <div :class="$style.levelTitle">Nivel 4</div>
          <img :class="$style.levelMiniImage" src="/assets/backgrounds/4_level_mini_bg.png" alt="Nivel 4" />
          <div :class="$style.levelName">Cripta del Lamento</div>
          <div :class="$style.boton">
            <div :class="$style.botonText">Jugar</div>
          </div>
        </div>

        <div :class="$style.levelCard" @click="selectLevel(5)">
          <div :class="$style.levelTitle">Nivel 5</div>
          <img :class="$style.levelMiniImage" src="/assets/backgrounds/5_level_mini_bg.png" alt="Nivel 5" />
          <div :class="$style.levelName">Santuario Interior</div>
          <div :class="$style.boton">
            <div :class="$style.botonText">Jugar</div>
          </div>
        </div>
      </div>

      <div :class="$style.botonesDeMenu">
        <div :class="$style.botonSalir" @click="backToMenu">
          <div :class="$style.botonSalirChild" />
          <div :class="$style.salir">Volver al Menu</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';

const router = useRouter();
const gameStore = useGameStore();

function selectLevel(level: number) {
  gameStore.startLevel(level);
  router.push('/ddd/play');
}

function backToMenu() {
  router.push('/ddd');
}
</script>

<style module>
.levelSelector {
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

.seleccionarNivel {
  position: relative;
  font-size: clamp(48px, 8vw, 96px);
  color: #d5c400;
  width: 100%;
  text-align: center;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  padding: 1rem;
  margin-bottom: 3rem;
  line-height: 1.2;
}

.frameParent {
  position: relative;
  width: 100%;
  max-width: 1415px;
  overflow-x: auto;
  overflow-y: visible;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  gap: 35px;
  padding: 1rem 0.5rem 2rem;
  margin-bottom: 2rem;
}

.levelCard {
  min-width: min(280px, 80vw);
  width: min(314px, 80vw);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #183037;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 19px;
  gap: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  opacity: 0.85;
}

.levelCard:hover {
  transform: scale(1.05);
  border-color: #ffff00;
  opacity: 1;
}

.levelTitle {
  align-self: stretch;
  position: relative;
  font-size: clamp(24px, 2.5vw, 40px);
  color: #f4d500;
  text-align: center;
}

.levelMiniImage {
  align-self: stretch;
  position: relative;
  border-radius: 20px;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  border: 2px solid rgba(165, 170, 0, 0.3);
}

.levelName {
  width: 100%;
  min-height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(24px, 2.5vw, 40px);
  color: #f4d500;
  text-align: center;
  padding: 0 0.5rem;
  line-height: 1.2;
}

.boton {
  width: min(223px, 70vw);
  height: clamp(48px, 8vh, 61px);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25) inset;
  border-radius: 20px;
  background-color: #a77307;
  border: 2px solid #a5aa00;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  position: relative;
  color: #fff;
  transition: background-color 0.2s ease;
}

.levelCard:hover .boton {
  background-color: #c98808;
}

.botonText {
  position: relative;
  font-size: clamp(22px, 2vw, 32px);
  color: #fff;
  text-align: center;
}

.botonesDeMenu {
  position: relative;
  width: min(408px, 90vw);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  padding-bottom: 2rem;
}

.botonSalir {
  width: 100%;
  height: clamp(72px, 12vh, 108px);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.botonSalir:hover {
  transform: scale(1.05);
}

.botonSalirChild {
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
  opacity: 0.7;
  transition: border-color 0.2s ease, opacity 0.2s ease;
}

.botonSalir:hover .botonSalirChild {
  border-color: #ffff00;
  opacity: 0.9;
}

.salir {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 108px;
  font-size: 40px;
  color: #f4d500;
  z-index: 1;
}

/* Responsive Styles */
@media (max-width: 1400px) {
  .frameParent {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .seleccionarNivel {
    font-size: clamp(32px, 6vw, 64px);
    margin-bottom: 2rem;
  }

  .frameParent {
    gap: 20px;
    padding: 1rem 0.5rem 1.5rem;
  }

  .levelCard {
    min-width: 240px;
    width: 280px;
    padding: 20px 15px;
    gap: 16px;
  }

  .levelTitle {
    font-size: 32px;
  }

  .levelName {
    font-size: 32px;
    min-height: 60px;
  }

  .boton {
    width: 180px;
    height: 55px;
  }

  .botonText {
    font-size: 32px;
  }

  .salir {
    font-size: 32px;
  }

  .botonesDeMenu {
    width: 100%;
    max-width: 340px;
  }

  .botonSalir {
    width: 100%;
  }

  .botonSalirChild {
    width: calc(100% - 20px);
  }
}

@media (max-width: 480px) {
  .seleccionarNivel {
    font-size: clamp(24px, 8vw, 48px);
    margin-bottom: 1.5rem;
  }

  .frameParent {
    gap: 15px;
  }

  .levelCard {
    min-width: 200px;
    width: 240px;
    padding: 16px 12px;
    gap: 12px;
  }

  .levelTitle {
    font-size: 28px;
  }

  .levelName {
    font-size: 26px;
    min-height: 50px;
  }

  .boton {
    width: 160px;
    height: 50px;
  }

  .botonText {
    font-size: 28px;
  }

  .salir {
    font-size: 28px;
  }
}
</style>
