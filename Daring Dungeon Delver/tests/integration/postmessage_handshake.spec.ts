import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuthProvider } from "../../src/auth/AuthProvider";
import { TokenMemoryStore } from "../../src/auth/TokenMemoryStore";
import { ApiClient } from "../../src/integration/ApiClient";
import { LeaderboardsService } from "../../src/integration/LeaderboardsService";
import { SessionService } from "../../src/integration/SessionService";

describe("postMessage handshake integration", () => {
  const portalOrigin = "https://portal.example";
  const apiBase = "https://api.example";

  let provider: AuthProvider;
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    provider = new AuthProvider(new TokenMemoryStore(), portalOrigin);
    provider.init();
    postMessageSpy = vi.spyOn(window, "postMessage");
  });

  afterEach(() => {
    window.removeEventListener(
      "message",
      (provider as unknown as { handleMessage: EventListener }).handleMessage
    );
    postMessageSpy.mockRestore();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("completes handshake and performs GET/PUT with bearer token", async () => {
    postMessageSpy.mockImplementation((...args: unknown[]) => {
      const [message, targetOrigin] = args;
      expect(targetOrigin).toBe(portalOrigin);

      if ((message as { type?: string })?.type === "UFRO_REQ_TOKEN") {
        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent("message", {
              origin: portalOrigin,
              data: { type: "UFRO_TOKEN", token: "fresh-token", gameId: 99 },
            })
          );
        }, 0);
      }
    });

    provider.requestToken();
    await vi.runAllTimersAsync();

    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url, init) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer fresh-token");

        return Promise.resolve(
          new Response(JSON.stringify({ leaderboard: [{ rank: 1, nickname: "A", score: 10 }] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      })
      .mockImplementationOnce((_url, init) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer fresh-token");

        return Promise.resolve(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      });

    const client = new ApiClient(apiBase, () => provider.getToken(), {
      fetchImpl: fetchMock,
      requestTokenRefresh: () => provider.refreshToken(2000),
    });

    const leaderboardsService = new LeaderboardsService(client);
    const leaderboard = await leaderboardsService.getLeaderboard(99);
    expect(leaderboard.leaderboard).toHaveLength(1);

    const sessionService = new SessionService(client);
    await sessionService.updateSession(99, {
      gameSessionDurationSeconds: 5,
      eventId: "evt-1",
    });

    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(provider.getToken()).toBe("fresh-token");
    expect(provider.getGameId()).toBe(99);
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
  });

  it("refreshes token once when API responds 401 after initial handshake", async () => {
    const issuedTokens = ["token-initial", "token-refreshed"];
    let handshakeCount = 0;
    postMessageSpy.mockImplementation((...args: unknown[]) => {
      const [message, targetOrigin] = args;
      expect(targetOrigin).toBe(portalOrigin);

      if ((message as { type?: string })?.type === "UFRO_REQ_TOKEN") {
        const token =
          issuedTokens[Math.min(handshakeCount, issuedTokens.length - 1)];
        handshakeCount += 1;

        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent("message", {
              origin: portalOrigin,
              data: { type: "UFRO_TOKEN", token, gameId: 55 },
            })
          );
        }, 0);
      }
    });

    provider = new AuthProvider(new TokenMemoryStore(), portalOrigin);
    provider.init();
    provider.requestToken();
    await vi.runAllTimersAsync();

    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url, init) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer token-initial");

        return Promise.resolve(
          new Response(JSON.stringify({ leaderboard: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      })
      .mockImplementationOnce((_url, init) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer token-initial");

        return Promise.resolve(new Response(null, { status: 401 }));
      })
      .mockImplementationOnce((_url, init) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer token-refreshed");

        return Promise.resolve(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      });

    const client = new ApiClient(apiBase, () => provider.getToken(), {
      fetchImpl: fetchMock,
      requestTokenRefresh: () => provider.refreshToken(2000),
    });

    const leaderboardsService = new LeaderboardsService(client);
    await leaderboardsService.getLeaderboard(55);

    const sessionService = new SessionService(client);
    const sessionUpdate = sessionService.updateSession(55, {
      gameSessionDurationSeconds: 10,
      eventId: "evt-1",
    });

    await vi.runAllTimersAsync();
    await sessionUpdate;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(provider.getToken()).toBe("token-refreshed");
    expect(provider.getGameId()).toBe(55);
    expect(postMessageSpy).toHaveBeenCalledTimes(2);
  });

  it("ignores messages from unexpected origins before accepting trusted token", async () => {
    let handshakeCount = 0;
    postMessageSpy.mockImplementation((...args: unknown[]) => {
      const [message, targetOrigin] = args;
      expect(targetOrigin).toBe(portalOrigin);

      if ((message as { type?: string })?.type === "UFRO_REQ_TOKEN") {
        handshakeCount += 1;

        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent("message", {
              origin: "https://attacker.example",
              data: { type: "UFRO_TOKEN", token: "stolen-token", gameId: 777 },
            })
          );
        }, 0);

        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent("message", {
              origin: portalOrigin,
              data: { type: "UFRO_TOKEN", token: "legit-token", gameId: 77 },
            })
          );
        }, 0);
      }
    });

    provider = new AuthProvider(new TokenMemoryStore(), portalOrigin);
    provider.init();
    provider.requestToken();

    await vi.runAllTimersAsync();

    expect(provider.getToken()).toBe("legit-token");
    expect(provider.getGameId()).toBe(77);

    const fetchMock = vi.fn().mockImplementation((_url, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer legit-token");

      return Promise.resolve(
        new Response(JSON.stringify({ leaderboard: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    const client = new ApiClient(apiBase, () => provider.getToken(), {
      fetchImpl: fetchMock,
      requestTokenRefresh: () => provider.refreshToken(2000),
    });

    const leaderboardsService = new LeaderboardsService(client);
    await leaderboardsService.getLeaderboard(77);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(handshakeCount).toBe(1);
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
  });
});
