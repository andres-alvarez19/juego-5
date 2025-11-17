import type {
  SessionPayload,
  SessionUpdatePayload,
  SessionResponse,
  ScorePayload,
  ScoreResponse,
  LeaderboardEntry,
} from '@/models/types';
import { safeFetch } from '@/utils/safeFetch';
import { authProvider } from './AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ufrogamelab.cl';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

/**
 * GameLabClient - Service for interacting with UfroGameLab API
 */
export class GameLabClient {
  private static instance: GameLabClient;

  private constructor() {
    if (DEV_MODE) {
      console.warn('[DEV MODE] GameLabClient running in development mode - API calls will be bypassed');
    }
  }

  static getInstance(): GameLabClient {
    if (!GameLabClient.instance) {
      GameLabClient.instance = new GameLabClient();
    }
    return GameLabClient.instance;
  }

  /**
   * Check if running in development mode
   */
  isDevMode(): boolean {
    return DEV_MODE;
  }

  /**
   * Validate current authentication token
   */
  async validate(): Promise<{ valid: boolean; user?: { id: string; name: string } }> {
    // Bypass in dev mode
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing authentication validation');
      return { 
        valid: true, 
        user: { 
          id: 'dev-user-123', 
          name: 'Dev User' 
        } 
      };
    }

    try {
      const headers = await authProvider.getAuthHeaders();
      const response = await safeFetch<{ valid: boolean; user?: { id: string; name: string } }>(
        `${API_BASE_URL}/auth/validate`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Validation failed:', error);
      return { valid: false };
    }
  }

  /**
   * Start a new game session
   */
  async startSession(payload: SessionPayload): Promise<SessionResponse> {
    // Bypass in dev mode
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing session start', payload);
      return {
        session_id: `dev-session-${Date.now()}`,
        status: 'active',
        message: 'Dev mode - session bypassed',
      };
    }

    const headers = await authProvider.getAuthHeaders();
    return safeFetch<SessionResponse>(`${API_BASE_URL}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * End a game session
   */
  async endSession(payload: SessionUpdatePayload): Promise<SessionResponse> {
    // Bypass in dev mode
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing session end', payload);
      return {
        session_id: payload.session_id,
        status: 'completed',
        message: 'Dev mode - session end bypassed',
      };
    }

    const headers = await authProvider.getAuthHeaders();
    return safeFetch<SessionResponse>(`${API_BASE_URL}/sessions/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Report a score
   */
  async reportScore(payload: ScorePayload): Promise<ScoreResponse> {
    // Bypass in dev mode
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing score report', payload);
      return {
        score_id: `dev-score-${Date.now()}`,
        status: 'recorded',
        message: 'Dev mode - score bypassed',
      };
    }

    const headers = await authProvider.getAuthHeaders();
    return safeFetch<ScoreResponse>(`${API_BASE_URL}/scores/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
    // Bypass in dev mode
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing leaderboard fetch', { gameId, limit });
      // No mock scores in dev mode; return empty list
      return [];
    }

    const headers = await authProvider.getAuthHeaders();
    return safeFetch<LeaderboardEntry[]>(
      `${API_BASE_URL}/leaderboard/${gameId}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }

  /**
   * Get user's scores
   */
  async getMyScores(gameId: string, userId: string): Promise<LeaderboardEntry[]> {
    // Bypass in dev mode
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing user scores fetch', { gameId, userId });
      // No mock scores in dev mode; return empty list
      return [];
    }

    const headers = await authProvider.getAuthHeaders();
    return safeFetch<LeaderboardEntry[]>(
      `${API_BASE_URL}/scores/${gameId}/user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }
}

export const gameLabClient = GameLabClient.getInstance();
