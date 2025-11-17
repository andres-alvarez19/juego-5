import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuthProvider } from "../../../src/auth/AuthProvider";
import { TokenMemoryStore } from "../../../src/auth/TokenMemoryStore";

describe("AuthProvider", () => {
  const allowedOrigin = "https://portal.test";
  let provider: AuthProvider;
  let store: TokenMemoryStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new TokenMemoryStore();
    provider = new AuthProvider(store, allowedOrigin);
    provider.init();
  });

  afterEach(() => {
    if (provider) {
      window.removeEventListener(
        "message",
        (provider as unknown as { handleMessage: EventListener }).handleMessage
      );
    }

    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("ignores messages from disallowed origins", () => {
    const subscriber = vi.fn();
    provider.onToken(subscriber);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://attacker.test",
        data: { type: "UFRO_TOKEN", token: "malicious-token" },
      })
    );

    expect(provider.getToken()).toBeNull();
    expect(subscriber).not.toHaveBeenCalled();
  });

  it("stores token and notifies subscribers on valid message", () => {
    const subscriber = vi.fn();
    provider.onToken(subscriber);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: allowedOrigin,
        data: { type: "UFRO_TOKEN", token: "secure-token", gameId: 101 },
      })
    );

    expect(provider.getToken()).toBe("secure-token");
    expect(provider.getGameId()).toBe(101);
    expect(subscriber).toHaveBeenCalledWith("secure-token", 101);
  });

  it("re-requests token when refreshToken is invoked", async () => {
    const requestSpy = vi.spyOn(provider, "requestToken");
    const refreshed = provider.refreshToken(1000);

    expect(requestSpy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: allowedOrigin,
        data: { type: "UFRO_TOKEN", token: "renewed-token" },
      })
    );

    await expect(refreshed).resolves.toBe("renewed-token");
    expect(provider.getToken()).toBe("renewed-token");
  });

  it("does not accept empty or missing token payloads", () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: allowedOrigin,
        data: { type: "UFRO_TOKEN", token: "   " },
      })
    );

    expect(provider.getToken()).toBeNull();

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: allowedOrigin,
        data: { type: "UFRO_TOKEN" },
      })
    );

    expect(provider.getToken()).toBeNull();
  });

  it("notifies all subscribers immediately when token already cached", () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: allowedOrigin,
        data: { type: "UFRO_TOKEN", token: "cached-token", gameId: 202 },
      })
    );

    const subscriberA = vi.fn();
    const subscriberB = vi.fn();

    provider.onToken(subscriberA);
    provider.onToken(subscriberB);

    expect(subscriberA).toHaveBeenCalledWith("cached-token", 202);
    expect(subscriberB).toHaveBeenCalledWith("cached-token", 202);
  });
});
