import type { SessionUpdatePayload } from "../types/api";
import { SessionService } from "../integration/SessionService";
import { onPageHide } from "./VisibilityHooks";
import { exponentialBackoff } from "../utils/backoff";
import { uuidv4 } from "../utils/idempotency";
import { logger } from "../utils/logger";

const DEFAULT_HEARTBEAT_SECONDS = parsePositiveNumber(
  import.meta.env.VITE_HEARTBEAT_SEC,
  20
);
const DEFAULT_MAX_BATCH_SECONDS = parsePositiveNumber(
  import.meta.env.VITE_MAX_BATCH_SEC,
  60
);
const MAX_SEND_ATTEMPTS = 3;

export interface SessionManagerServices {
  session: SessionService;
}

export interface SessionManagerOptions {
  heartbeatSeconds?: number;
  maxBatchSeconds?: number;
  getGameId?: () => number | null;
  getAuthToken?: () => string | null;
}

export class SessionManager {
  private readonly services: SessionManagerServices;
  private readonly heartbeatSeconds: number;
  private readonly maxBatchSeconds: number;
  private readonly getGameId: () => number | null;
  private readonly getAuthToken?: () => string | null;

  private accumulatedSeconds = 0;
  private maxScore: number | null = null;
  private running = false;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private flushChain: Promise<void> = Promise.resolve();
  private removePageHideListener: (() => void) | null = null;

  constructor(services: SessionManagerServices, options: SessionManagerOptions = {}) {
/**
 * SessionManager module
 * 
 * Administra el ciclo de vida de la sesión del usuario en el cliente.
 * Incluye integración con servicios de sesión y almacenamiento.
 *
 * @module SessionManager
 */
    this.services = services;
    this.heartbeatSeconds = options.heartbeatSeconds ?? DEFAULT_HEARTBEAT_SECONDS;
    this.maxBatchSeconds = options.maxBatchSeconds ?? DEFAULT_MAX_BATCH_SECONDS;
    this.getGameId = options.getGameId ?? (() => null);
    this.getAuthToken = options.getAuthToken;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.scheduleHeartbeat();
    this.removePageHideListener = onPageHide(() => {
      void this.flushWithBeacon();
    });
  }

  stop(): void {
    this.running = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.removePageHideListener) {
      this.removePageHideListener();
      this.removePageHideListener = null;
    }
  }

  addPlaytime(deltaSec: number): void {
    if (!Number.isFinite(deltaSec) || deltaSec <= 0) {
      return;
    }
    this.accumulatedSeconds += deltaSec;
  }

  setScore(score: number): void {
    if (!Number.isFinite(score) || score < 0) {
      return;
    }

    if (this.maxScore === null || score > this.maxScore) {
      this.maxScore = score;
    }
  }

  flush(force = false): Promise<void> {
    this.flushChain = this.flushChain
      .then(() => this.performFlush(force))
      .catch((error) => {
        logger.warn("Session flush failed", { error });
      });

    return this.flushChain;
  }

  private scheduleHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      void this.flush();
    }, this.heartbeatSeconds * 1000);
  }

  private async performFlush(force: boolean): Promise<void> {
    const gameId = this.getGameId();
    if (gameId === null) {
      return;
    }

    const chunkSeconds = this.pickChunk(force);
    if (!chunkSeconds) {
      return;
    }

    const payload = this.buildPayload(chunkSeconds);
    const success = await this.sendWithRetry(gameId, payload);

    if (success) {
      this.accumulatedSeconds = Math.max(0, this.accumulatedSeconds - chunkSeconds);
    }
  }

  private pickChunk(force: boolean): number {
    if (this.accumulatedSeconds <= 0) {
      return 0;
    }

    if (!force) {
      return Math.min(this.accumulatedSeconds, this.maxBatchSeconds);
    }

    return Math.min(this.accumulatedSeconds, this.maxBatchSeconds);
  }

  private buildPayload(durationSeconds: number): SessionUpdatePayload {
    const payload: SessionUpdatePayload = {
      gameSessionDurationSeconds: Math.round(durationSeconds),
      eventId: uuidv4(),
    };

    if (this.maxScore !== null) {
      payload.scoreAchieved = this.maxScore;
    }

    return payload;
  }

  private async sendWithRetry(
    gameId: number,
    payload: SessionUpdatePayload
  ): Promise<boolean> {
    for (let attempt = 0; attempt < MAX_SEND_ATTEMPTS; attempt += 1) {
      try {
        await this.services.session.updateSession(gameId, payload);
        return true;
      } catch (error) {
        if (attempt === MAX_SEND_ATTEMPTS - 1) {
          logger.warn("Session update failed", { error });
          return false;
        }

        const delay = exponentialBackoff(attempt);
        await wait(delay);
      }
    }

    return false;
  }

  private async flushWithBeacon(): Promise<void> {
    const gameId = this.getGameId();
    if (gameId === null || this.accumulatedSeconds <= 0) {
      return;
    }

    // Attempt to send all remaining data in consecutive batches.
    while (this.accumulatedSeconds > 0) {
      const chunkSeconds = Math.min(this.accumulatedSeconds, this.maxBatchSeconds);
      const payload = this.buildPayload(chunkSeconds);

      const beaconPayload = this.prepareBeaconPayload(payload);
      const sent = this.sendBeacon(gameId, beaconPayload);

      if (!sent) {
        // Fall back to async flush if beacon fails.
        await this.performFlush(true);
        break;
      }

      this.accumulatedSeconds = Math.max(
        0,
        this.accumulatedSeconds - chunkSeconds
      );
    }
  }

  private prepareBeaconPayload(payload: SessionUpdatePayload): SessionUpdatePayload {
    const clone: SessionUpdatePayload = {
      gameSessionDurationSeconds: payload.gameSessionDurationSeconds,
      eventId: payload.eventId,
    };

    if (typeof payload.scoreAchieved === "number") {
      clone.scoreAchieved = payload.scoreAchieved;
    }

    const token = this.getAuthToken?.();
    if (token) {
      // Some backends do not honor Authorization headers on sendBeacon.
      clone.authToken = token;
    }

    return clone;
  }

  private sendBeacon(gameId: number, payload: SessionUpdatePayload): boolean {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.sendBeacon !== "function"
    ) {
      return false;
    }

    const url = this.services.session.getEndpoint(gameId);
    const body = JSON.stringify(payload);

    if (body.length >= 64 * 1024) {
      logger.warn("Beacon payload too large, skipping", {
        size: body.length,
      });
      return false;
    }

    try {
      const blob = new Blob([body], { type: "application/json" });
      return navigator.sendBeacon(url, blob);
    } catch (error) {
      logger.warn("navigator.sendBeacon failed", { error });
      return false;
    }
  }
}

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return fallback;
  }

  return normalized;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
