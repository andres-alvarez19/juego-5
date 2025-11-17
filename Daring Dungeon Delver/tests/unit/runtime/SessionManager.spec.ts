import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SessionManager } from "../../../src/runtime/SessionManager";
import { SessionService } from "../../../src/integration/SessionService";
import { resetVisibilityHooks } from "../../../src/runtime/VisibilityHooks";
import { TEST_BASE_URL } from "../../support/test-urls";

describe("SessionManager", () => {
  let sessionService: {
    updateSession: ReturnType<typeof vi.fn>;
    getEndpoint: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    sessionService = {
      updateSession: vi.fn().mockResolvedValue(undefined),
      getEndpoint: vi.fn().mockReturnValue(
        `${TEST_BASE_URL}/collection/my-games/1/session-update`
      ),
    };
  });

  afterEach(() => {
    resetVisibilityHooks();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("sends heartbeat using accumulated playtime", async () => {
    const manager = new SessionManager(
      { session: sessionService as unknown as SessionService },
      {
        heartbeatSeconds: 5,
        maxBatchSeconds: 60,
        getGameId: () => 42,
      }
    );

    manager.start();
    manager.addPlaytime(3);

    await vi.advanceTimersByTimeAsync(5000);
    await manager.flush();

    expect(sessionService.updateSession).toHaveBeenCalledTimes(1);
    expect(sessionService.updateSession).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ gameSessionDurationSeconds: 3 })
    );
  });

  it("caps each flush by maxBatchSeconds", async () => {
    const manager = new SessionManager(
      { session: sessionService as unknown as SessionService },
      {
        heartbeatSeconds: 30,
        maxBatchSeconds: 10,
        getGameId: () => 7,
      }
    );

    manager.addPlaytime(25);

    await manager.flush(true);
    expect(sessionService.updateSession).toHaveBeenCalledTimes(1);
    expect(sessionService.updateSession).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ gameSessionDurationSeconds: 10 })
    );

    await manager.flush(true);
    expect(sessionService.updateSession).toHaveBeenCalledTimes(2);
    expect(sessionService.updateSession).toHaveBeenLastCalledWith(
      7,
      expect.objectContaining({ gameSessionDurationSeconds: 10 })
    );
  });

  it("uses navigator.sendBeacon on pagehide with auth token in body", async () => {
    const manager = new SessionManager(
      { session: sessionService as unknown as SessionService },
      {
        heartbeatSeconds: 30,
        maxBatchSeconds: 60,
        getGameId: () => 9,
        getAuthToken: () => "beacon-token",
      }
    );

    const sendBeaconMock = vi.fn().mockReturnValue(true);
    (manager as { sendBeacon: unknown }).sendBeacon = sendBeaconMock;

    manager.start();
    manager.addPlaytime(5);

    window.dispatchEvent(new Event("pagehide"));

    await Promise.resolve();
    await Promise.resolve();

    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    const [, payload] = sendBeaconMock.mock.calls[0];

    expect(payload).toMatchObject({
      gameSessionDurationSeconds: 5,
      authToken: "beacon-token",
    });
    expect(sessionService.updateSession).not.toHaveBeenCalled();
  });

  it("falls back to updateSession when sendBeacon fails", async () => {
    const manager = new SessionManager(
      { session: sessionService as unknown as SessionService },
      {
        heartbeatSeconds: 30,
        maxBatchSeconds: 60,
        getGameId: () => 11,
      }
    );

    const sendBeaconMock = vi.fn().mockReturnValue(false);
    (manager as { sendBeacon: unknown }).sendBeacon = sendBeaconMock;

    manager.start();
    manager.addPlaytime(4);

    window.dispatchEvent(new Event("pagehide"));
    await Promise.resolve();
    await Promise.resolve();

    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    expect(sessionService.updateSession).toHaveBeenCalledTimes(1);
    expect(sessionService.updateSession).toHaveBeenCalledWith(
      11,
      expect.objectContaining({ gameSessionDurationSeconds: 4 })
    );
  });
});
