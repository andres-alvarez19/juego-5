<template>
  <div class="app-root">
    <div v-if="!checked" class="app-loading">
      Cargando...
    </div>
    <div v-else-if="!isAuthorized" class="app-unauthorized">
      <div class="app-unauthorized-card">
        <h1>No autorizado</h1>
        <p>No se encontró un token válido para jugar Daring Dungeon Delver.</p>
        <p>Inicia sesión desde UfroGameLab para acceder al juego.</p>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { authProvider } from '@/services/AuthProvider';

const userStore = useUserStore();
const isAuthorized = ref(false);
const checked = ref(false);

onMounted(() => {
  // Check for existing authentication
  const token = authProvider.getToken();
  if (token) {
    // In a real app, you would validate the token and get user info
    // For now, we'll set a mock user
    userStore.setUser({
      id: 'user-123',
      displayName: 'Player',
      token,
    });
    isAuthorized.value = true;
  } else {
    isAuthorized.value = false;
  }

  checked.value = true;
});
</script>

<style>
@import '@/assets/styles/style.css';

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.app-root {
  width: 100%;
  height: 100%;
}

.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
  background-color: #000000;
}

.app-unauthorized {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #000000;
  color: #ffffff;
  text-align: center;
  padding: 1rem;
  box-sizing: border-box;
}

.app-unauthorized-card {
  max-width: 640px;
  padding: 2rem;
  border-radius: 16px;
  background-color: #111827;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.app-unauthorized-card h1 {
  margin-bottom: 1rem;
  color: #fbbf24;
}
</style>
