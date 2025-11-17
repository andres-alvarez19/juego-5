import { describe, it, expect, vi } from "vitest";
import { parseRetryAfter, wait } from "../../../src/integration/retry";

describe("retry helpers", () => {
  it("parses seconds Retry-After", () => {
    const ms = parseRetryAfter("2");
    expect(ms).toBe(2000);
  });

  it("parses HTTP-date Retry-After in future", () => {
    const future = new Date(Date.now() + 3000).toUTCString();
    const ms = parseRetryAfter(future);
    // allow some small clock drift — ensure it's roughly 3s
    expect(typeof ms).toBe("number");
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(4000);
  });

  it("wait resolves after duration", async () => {
    vi.useFakeTimers();
    const p = wait(1000);
    vi.advanceTimersByTime(1000);
    await p;
    vi.useRealTimers();
  });
});
