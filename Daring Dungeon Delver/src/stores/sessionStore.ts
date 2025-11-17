import { defineStore } from 'pinia';
import { getCurrentTimestamp } from '@/utils/formatTime';

interface SessionState {
  sessionId: string | null;
  startedAt: string | null;
  isActive: boolean;
  mode: string;
  level: number;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    sessionId: null,
    startedAt: null,
    isActive: false,
    mode: 'normal',
    level: 1,
  }),

  getters: {
    hasActiveSession: (state): boolean => state.isActive && !!state.sessionId,
    sessionDuration: (state): number => {
      if (!state.startedAt) return 0;
      const start = new Date(state.startedAt).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000);
    },
  },

  actions: {
    startSession(sessionId: string, mode = 'normal', level = 1) {
      this.sessionId = sessionId;
      this.startedAt = getCurrentTimestamp();
      this.isActive = true;
      this.mode = mode;
      this.level = level;
    },

    endSession() {
      this.sessionId = null;
      this.startedAt = null;
      this.isActive = false;
      this.mode = 'normal';
      this.level = 1;
    },

    updateLevel(level: number) {
      this.level = level;
    },
  },
});
