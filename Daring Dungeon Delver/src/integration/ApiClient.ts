import { exponentialBackoff } from "../utils/backoff";
import { logger } from "../utils/logger";
import { ApiError } from "./errors";
import { parseResponse, safeReadBody } from "./response";
import { parseRetryAfter, wait } from "./retry";
import { resolveApiBase } from "./config";

/**
 * ApiClient module
 * 
 * Proporciona clases y utilidades para interactuar con la API del backend del juego.
 * Incluye manejo de autenticación, peticiones y errores.
 *
 * @module ApiClient
 */
const DEFAULT_MAX_ATTEMPTS = 4;

export interface ApiClientOptions {
  requestTokenRefresh?: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
}

export type AuthorizedRequestInfo = RequestInfo | URL;

export { ApiError } from "./errors";

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;
  private readonly requestTokenRefresh?: () => Promise<string | null>;
  private readonly fetchImpl: typeof fetch;
  private readonly maxAttempts: number;

  constructor(
    baseUrl: string,
    getToken: () => string | null,
    options: ApiClientOptions = {}
  ) {
    const normalizedBase = baseUrl.replace(/\/+$/, "");
    const parsedBase = new URL(normalizedBase);
    if (
      parsedBase.protocol !== "https:" &&
      parsedBase.hostname !== "localhost" &&
      parsedBase.hostname !== "127.0.0.1"
    ) {
      throw new Error("VITE_API_BASE must use HTTPS");
    }

    this.baseUrl = normalizedBase;
    this.getToken = getToken;
    this.requestTokenRefresh = options.requestTokenRefresh;
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  }

  resolveUrl(path: string): string {
    return new URL(path, `${this.baseUrl}/`).toString();
  }

  async request<T>(input: AuthorizedRequestInfo, init: RequestInit = {}): Promise<T> {
    const resolvedUrl = this.resolveInputUrl(input);
    let attempt = 0;
    let hadUnauthorizedRetry = false;
    let lastError: unknown = null;

    while (attempt < this.maxAttempts) {
      const requestInit = this.enrichInitWithAuth(init);

      try {
        const response = await this.fetchImpl(resolvedUrl, requestInit);

        if (response.status === 401) {
          if (!hadUnauthorizedRetry && this.requestTokenRefresh) {
            hadUnauthorizedRetry = true;
            this.clearAuthHeader(requestInit);
            const token = await this.requestTokenRefresh();
            if (token) {
              attempt += 1;
              continue;
            }
          }

          throw await this.buildError(
            "Unauthorized request",
            response,
            resolvedUrl,
            attempt + 1
          );
        }

        if (response.status === 429) {
          attempt += 1;
          if (attempt >= this.maxAttempts) {
            throw await this.buildError(
              "Too many requests",
              response,
              resolvedUrl,
              attempt
            );
          }

          const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
          await wait(retryAfter ?? exponentialBackoff(attempt));
          continue;
        }

        if (response.status >= 500) {
          attempt += 1;
          if (attempt >= this.maxAttempts) {
            throw await this.buildError(
              "Server error",
              response,
              resolvedUrl,
              attempt
            );
          }

          await wait(exponentialBackoff(attempt));
          continue;
        }

        if (!response.ok) {
          throw await this.buildError(
            "Request failed",
            response,
            resolvedUrl,
            attempt + 1
          );
        }

        return await parseResponse<T>(response);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        attempt += 1;
        if (attempt >= this.maxAttempts) {
          break;
        }

        await wait(exponentialBackoff(attempt));
      }
    }

    const apiError =
      lastError instanceof ApiError
        ? lastError
        : new ApiError("Network request failed", {
            endpoint: this.resolveInputUrl(input),
            attempts: attempt,
            cause: lastError ?? new Error("Unknown error"),
          });

    logger.warn("API client exhausted retries", { error: apiError });
    throw apiError;
  }

  private enrichInitWithAuth(init: RequestInit): RequestInit {
    const headers = new Headers(init.headers ?? {});
    const token = this.getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    return {
      ...init,
      headers,
    };
  }

  private clearAuthHeader(init: RequestInit): void {
    const headers = new Headers(init.headers ?? {});
    headers.delete("Authorization");
    init.headers = headers;
  }
  private async buildError(
    message: string,
    response: Response,
    endpoint: string,
    attempts: number
  ): Promise<ApiError> {
    const body = await safeReadBody(response);

    return new ApiError(message, {
      status: response.status,
      endpoint,
      attempts,
      body,
    });
  }

  private resolveInputUrl(input: AuthorizedRequestInfo): string {
    if (typeof input === "string") {
      return this.resolveUrl(input);
    }

    if (input instanceof URL) {
      return input.toString();
    }

    if (input instanceof Request) {
      return input.url;
    }

    return this.resolveUrl(String(input));
  }
}

export const createApiClient = (
  options: {
    getToken: () => string | null;
    requestTokenRefresh?: () => Promise<string | null>;
    fetchImpl?: typeof fetch;
    maxAttempts?: number;
  }
): ApiClient => {
  const baseUrl = resolveApiBase();
  return new ApiClient(baseUrl, options.getToken, {
    requestTokenRefresh: options.requestTokenRefresh,
    fetchImpl: options.fetchImpl,
    maxAttempts: options.maxAttempts,
  });
};
