import { TokenMemoryStore } from "./TokenMemoryStore";
import { logger } from "../utils/logger";

type TokenSubscriber = (token: string, gameId?: number) => void;

interface TokenMessage {
  type: "UFRO_TOKEN";
  token: string;
  gameId?: number;
}

const TOKEN_REQUEST_MESSAGE = "UFRO_REQ_TOKEN";

const DEFAULT_REFRESH_TIMEOUT_MS = 10_000;

export class AuthProvider {
  private readonly allowedOrigin: string;
  private readonly store: TokenMemoryStore;
  private readonly subscribers = new Set<TokenSubscriber>();
  private readonly oneTimeResolvers = new Set<(token: string) => void>();
  private gameId: number | null = null;
  private initialized = false;

  constructor(
    store: TokenMemoryStore = new TokenMemoryStore(),
    allowedOrigin: string = import.meta.env.VITE_ALLOWED_ORIGIN
  ) {
    this.store = store;
    this.allowedOrigin = allowedOrigin;
  }

  init(): void {
    if (this.initialized || typeof window === "undefined") {
      return;
    }

    window.addEventListener("message", this.handleMessage);
    this.initialized = true;
  }

  requestToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    const targetWindow =
      window.parent && window.parent !== window ? window.parent : window;

    try {
      targetWindow.postMessage(
        { type: TOKEN_REQUEST_MESSAGE },
        this.allowedOrigin
      );
    } catch (error) {
      logger.warn("Unable to request UFRO token", { error });
    }
  }

  onToken(cb: TokenSubscriber): () => void {
    this.subscribers.add(cb);

    const currentToken = this.store.get();
    if (currentToken) {
      cb(currentToken, this.gameId ?? undefined);
    }

    return () => {
      this.subscribers.delete(cb);
    };
  }

  getGameId(): number | null {
    return this.gameId;
  }

  getToken(): string | null {
    return this.store.get();
  }

  clearToken(): void {
    this.store.clear();
  }

  async refreshToken(timeoutMs: number = DEFAULT_REFRESH_TIMEOUT_MS): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    this.requestToken();

    try {
      return await this.waitForNextToken(timeoutMs);
    } catch (error) {
      logger.warn("Token refresh timed out", { error });
      return null;
    }
  }

  private waitForNextToken(timeoutMs: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let settled = false;

      const timeout = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          this.oneTimeResolvers.delete(onResolve);
          reject(new Error("UFRO token refresh timeout"));
        }
      }, timeoutMs);

      const onResolve = (token: string): void => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeout);
        this.oneTimeResolvers.delete(onResolve);
        resolve(token);
      };

      this.oneTimeResolvers.add(onResolve);
    });
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.origin !== this.allowedOrigin) {
      return;
    }

    const data: unknown = event.data;
    if (
      !data ||
      typeof data !== "object" ||
      (data as { type?: unknown }).type !== "UFRO_TOKEN"
    ) {
      return;
    }

    const message = data as TokenMessage;

    if (typeof message.token !== "string" || !message.token.trim()) {
      logger.warn("Received UFRO token message without valid token");
      return;
    }

    this.store.set(message.token);
    this.gameId =
      typeof message.gameId === "number" ? message.gameId : this.gameId;

    for (const resolver of this.oneTimeResolvers) {
      resolver(message.token);
    }
    this.oneTimeResolvers.clear();

    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(message.token, this.gameId ?? undefined);
      } catch (error) {
        logger.warn("AuthProvider subscriber failed", { error });
      }
    });
  };
}

export const authProvider = new AuthProvider();

