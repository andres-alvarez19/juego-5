import { ApiClient } from "./ApiClient";
import { logger } from "../utils/logger";

export class LaunchInfoService {
  constructor(private readonly client: ApiClient) {}

  async validateSession(gameId: number): Promise<boolean> {
    const path = `/collection/my-games/${gameId}/launch-info`;

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

