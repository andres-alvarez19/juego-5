import { defineStore } from 'pinia';
import type { LeaderboardEntry } from '@/models/types';
import { gameLabClient } from '@/services/GameLabClient';

interface LocalScore {
  score: number;
  mode: string;
  level: number;
  date: string;
}

interface ScoreState {
  lastScore: number;
  campaignBestScore: number;
  bestScores: LeaderboardEntry[];
  recentScores: LocalScore[];
  isLoading: boolean;
  error: string | null;
}

const RECENT_SCORES_KEY = 'ddd_recent_scores';

function getInitialRecentScores(): LocalScore[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SCORES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        const candidate = item as Partial<LocalScore>;
        if (
          typeof candidate.score === 'number' &&
          typeof candidate.mode === 'string' &&
          typeof candidate.level === 'number' &&
          typeof candidate.date === 'string'
        ) {
          return {
            score: candidate.score,
            mode: candidate.mode,
            level: candidate.level,
            date: candidate.date,
          } as LocalScore;
        }
        return null;
      })
      .filter((item): item is LocalScore => item !== null);
  } catch {
    return [];
  }
}

function saveRecentScores(scores: LocalScore[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(RECENT_SCORES_KEY, JSON.stringify(scores));
  } catch {
    // Ignore persistence errors
  }
}

export const useScoreStore = defineStore('score', {
  state: (): ScoreState => ({
    lastScore: 0,
    campaignBestScore: 0,
    bestScores: [],
    recentScores: getInitialRecentScores(),
    isLoading: false,
    error: null,
  }),

  getters: {
    highestScore: (state): number => {
      if (state.bestScores.length === 0) return 0;
      return Math.max(...state.bestScores.map((s) => s.score));
    },
  },

  actions: {
    pushScore(score: number, isCampaign = false) {
      this.lastScore = score;

      if (isCampaign && score > this.campaignBestScore) {
        this.campaignBestScore = score;
      }
    },

    recordLocalScore(score: number, mode: string, level: number) {
      if (!Number.isFinite(score) || score < 0) {
        return;
      }

      const entry: LocalScore = {
        score,
        mode,
        level,
        date: new Date().toISOString(),
      };

      // Mantener solo los últimos 10 puntajes en local
      this.recentScores = [entry, ...this.recentScores].slice(0, 10);
      saveRecentScores(this.recentScores);
    },

    async fetchMyScores(gameId: string, userId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const scores = await gameLabClient.getMyScores(gameId, userId);
        this.bestScores = scores;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch scores';
        console.error('Failed to fetch scores:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchLeaderboard(gameId: string, limit = 10) {
      this.isLoading = true;
      this.error = null;
      try {
        const scores = await gameLabClient.getLeaderboard(gameId, limit);
        this.bestScores = scores;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
