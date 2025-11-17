import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiClient, ApiError } from "../../../src/integration/ApiClient";
import { sessionUpdatePath, leaderboardsPath } from "../../../src/integration/endpoints";
import { TEST_BASE_URL } from "../../support/test-urls";

const BASE_URL = TEST_BASE_URL;

describe("ApiClient", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("adds Authorization header when token is present", async () => {
    const fetchMock = vi.fn(async (_url, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer present-token");

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new ApiClient(BASE_URL, () => "present-token", {
      fetchImpl: fetchMock,
    });

    const result = await client.request<{ ok: boolean }>("/resource");
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("attempts a single token refresh on 401", async () => {
    let token = "stale-token";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const refreshMock = vi.fn(async () => {
      token = "fresh-token";
      return token;
    });

    const client = new ApiClient(BASE_URL, () => token, {
      fetchImpl: fetchMock,
      requestTokenRefresh: refreshMock,
    });

    const response = await client.request<{ ok: boolean }>("/secure");

    expect(response.ok).toBe(true);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("respects Retry-After header on 429", async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 429,
          headers: { "Retry-After": "1" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new ApiClient(BASE_URL, () => "rate-token", {
      fetchImpl: fetchMock,
    });

    const request = client.request<{ ok: boolean }>("/rate-limited");

    await vi.advanceTimersByTimeAsync(1000);
    const result = await request;

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries 5xx responses with backoff and eventually throws", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));

    const client = new ApiClient(BASE_URL, () => "unstable-token", {
      fetchImpl: fetchMock,
    });

    const request = client.request("/unstable");
    request.catch(() => {});
    await vi.runAllTimersAsync();

    await expect(request).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("backs off when 429 lacks Retry-After header", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new ApiClient(BASE_URL, () => "rate-token", {
      fetchImpl: fetchMock,
    });

    const promise = client.request<{ ok: boolean }>("/rate-limited");

    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries network failures up to maxAttempts and throws ApiError", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Network down"));

    const client = new ApiClient(BASE_URL, () => "token", {
      fetchImpl: fetchMock,
      maxAttempts: 3,
    });

    const request = client.request("/unstable");
    request.catch(() => {});
    await vi.runAllTimersAsync();

    await expect(request).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe("endpoint helpers", () => {
  it("sessionUpdatePath returns correct path for number and string", () => {
    expect(sessionUpdatePath(42)).toBe("/collection/my-games/42/session-update");
    expect(sessionUpdatePath("abc")).toBe("/collection/my-games/abc/session-update");
  });

  it("leaderboardsPath returns correct path and encodes limit", () => {
    expect(leaderboardsPath(99)).toBe("/collection/leaderboards/99?limit=10");
    expect(leaderboardsPath("gameX", 25)).toBe("/collection/leaderboards/gameX?limit=25");
    expect(leaderboardsPath("gameX", 0)).toBe("/collection/leaderboards/gameX?limit=0");
    expect(leaderboardsPath("gameX", 1000)).toBe("/collection/leaderboards/gameX?limit=1000");
  });

  it("leaderboardsPath encodes special characters in limit", () => {
    expect(leaderboardsPath("gameY", "10&bad" as any)).toBe("/collection/leaderboards/gameY?limit=10%26bad");
  });
});

