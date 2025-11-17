import { ApiClient } from "./ApiClient";
import { logger } from "../utils/logger";

export class LaunchInfoService {
  constructor(private readonly client: ApiClient) {}

  async validateSession(gameId: number | string): Promise<boolean> {
    // Usamos ruta relativa sin slash inicial para que respete el path base de la API (ej: /v0, /v1)
    const path = `collection/my-games/${gameId}/launch-info`;

    try {
      logger.info("[LaunchInfoService] Validating session", {
        path,
        gameId,
      });

      await this.client.request(path, {
        method: "GET",
      });

      return true;
    } catch (error) {
      logger.warn("[LaunchInfoService] Session validation failed", {
        path,
        gameId,
        error,
      });
      return false;
    }
  }
}
