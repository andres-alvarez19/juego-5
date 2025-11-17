<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { authProvider } from '@/services/AuthProvider';

const userStore = useUserStore();

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
  }
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
</style>
