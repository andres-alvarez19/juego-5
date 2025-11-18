import type { LeaderboardRow } from "../types/api";
import { ApiClient } from "./ApiClient";
import { leaderboardsPath } from "./endpoints";

interface LeaderboardResponse {
  data: LeaderboardRow[];
  status: boolean;
}

export class LeaderboardsService {
  constructor(private readonly client: ApiClient) {}

/**
 * LeaderboardsService module
 * 
 * Gestiona la obtención y envío de datos de tablas de clasificación del juego.
 *
 * @module LeaderboardsService
 */
  async getLeaderboard(
    gameId: number,
    limit = 10
  ): Promise<LeaderboardResponse> {
    const path = leaderboardsPath(gameId, limit);
    return this.client.request<LeaderboardResponse>(path, {
      method: "GET",
    });
  }
}
