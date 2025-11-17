import type { SessionUpdatePayload } from "../types/api";
import { ApiClient } from "./ApiClient";
import { sessionUpdatePath } from "./endpoints";

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
    return this.client.request(sessionUpdatePath(gameId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  getEndpoint(gameId: number): string {
    return this.client.resolveUrl(sessionUpdatePath(gameId));
  }
}

