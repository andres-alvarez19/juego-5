import type { SessionUpdatePayload } from "../types/api";
import { ApiClient } from "./ApiClient";
import { sessionUpdatePath } from "./endpoints";
import { logger } from "../utils/logger";

export class SessionService {
  constructor(private readonly client: ApiClient) {}

  /**
   * SessionService module
   * 
   * Proporciona métodos para gestionar sesiones de usuario y sincronización con el backend.
   *
   * @module SessionService
   */
  async updateSession(
    gameId: number,
    payload: SessionUpdatePayload
  ): Promise<unknown> {
    const path = sessionUpdatePath(gameId);

    logger.info("[SessionService] Sending session update", {
      path,
      gameId,
      payload,
    });

    const response = await this.client.request(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    logger.debug("[SessionService] Session update completed", {
      path,
      gameId,
    });

    return response;
  }

  getEndpoint(gameId: number): string {
    return this.client.resolveUrl(sessionUpdatePath(gameId));
  }
}
