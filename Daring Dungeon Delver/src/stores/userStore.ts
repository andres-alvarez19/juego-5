import { defineStore } from 'pinia';
import type { User } from '@/models/types';

interface UserState {
  user: User | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    displayName: (state) => state.user?.displayName || 'Guest',
    userId: (state) => state.user?.id || '',
  },

  actions: {
    setUser(user: User) {
      this.user = user;
    },

    clearUser() {
      this.user = null;
    },

    updateToken(token: string) {
      if (this.user) {
        this.user.token = token;
      }
    },
  },
});
