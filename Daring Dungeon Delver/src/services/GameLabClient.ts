import type {
  SessionPayload,
  SessionUpdatePayload,
  SessionResponse,
  ScorePayload,
  ScoreResponse,
  LeaderboardEntry,
} from '@/models/types';
import { safeFetch } from '@/utils/safeFetch';
import { logger } from '@/utils/logger';
import { authProvider } from './AuthProvider';

// Backend base URL: restrict to local Spring Boot instance
const API_BASE_URL = 'http://localhost:8080';

/**
 * GameLabClient - Service for interacting with UfroGameLab API
 */
export class GameLabClient {
  private static instance: GameLabClient;

  private constructor() {}

  static getInstance(): GameLabClient {
    if (!GameLabClient.instance) {
      GameLabClient.instance = new GameLabClient();
    }
    return GameLabClient.instance;
  }

  /**
   * Validate current authentication token
   */
  async validate(): Promise<{ valid: boolean; user?: { id: string; name: string } }> {
    const url = `${API_BASE_URL}/auth/validate`;

    try {
      const headers = await authProvider.getAuthHeaders();

      logger.info('[GameLabClient] Sending auth validation request', {
        url,
        method: 'GET',
      });

      const response = await safeFetch<{ valid: boolean; user?: { id: string; name: string } }>(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );

      logger.debug('[GameLabClient] Received auth validation response', {
        url,
        response,
      });

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
    const url = `${API_BASE_URL}/sessions/start`;
    const headers = await authProvider.getAuthHeaders();

    logger.info('[GameLabClient] Sending startSession request', {
      url,
      method: 'POST',
      payload,
    });

    const response = await safeFetch<SessionResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    logger.debug('[GameLabClient] Received startSession response', {
      url,
      response,
    });

    return response;
  }

  /**
   * End a game session
   */
  async endSession(payload: SessionUpdatePayload): Promise<SessionResponse> {
    const url = `${API_BASE_URL}/sessions/end`;
    const headers = await authProvider.getAuthHeaders();

    logger.info('[GameLabClient] Sending endSession request', {
      url,
      method: 'POST',
      payload,
    });

    const response = await safeFetch<SessionResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    logger.debug('[GameLabClient] Received endSession response', {
      url,
      response,
    });

    return response;
  }

  /**
   * Report a score
   */
  async reportScore(payload: ScorePayload): Promise<ScoreResponse> {
    const url = `${API_BASE_URL}/scores/report`;
    const headers = await authProvider.getAuthHeaders();

    logger.info('[GameLabClient] Sending reportScore request', {
      url,
      method: 'POST',
      payload,
    });

    const response = await safeFetch<ScoreResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    logger.debug('[GameLabClient] Received reportScore response', {
      url,
      response,
    });

    return response;
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const url = `${API_BASE_URL}/leaderboard/${gameId}?limit=${limit}`;
    const headers = await authProvider.getAuthHeaders();

    logger.info('[GameLabClient] Sending getLeaderboard request', {
      url,
      method: 'GET',
      gameId,
      limit,
    });

    const response = await safeFetch<LeaderboardEntry[]>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    logger.debug('[GameLabClient] Received getLeaderboard response', {
      url,
      count: response.length,
    });

    return response;
  }

  /**
   * Get user's scores
   */
  async getMyScores(gameId: string, userId: string): Promise<LeaderboardEntry[]> {
    const url = `${API_BASE_URL}/scores/${gameId}/user/${userId}`;
    const headers = await authProvider.getAuthHeaders();

    logger.info('[GameLabClient] Sending getMyScores request', {
      url,
      method: 'GET',
      gameId,
      userId,
    });

    const response = await safeFetch<LeaderboardEntry[]>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    logger.debug('[GameLabClient] Received getMyScores response', {
      url,
      count: response.length,
    });

    return response;
  }
}

export const gameLabClient = GameLabClient.getInstance();
