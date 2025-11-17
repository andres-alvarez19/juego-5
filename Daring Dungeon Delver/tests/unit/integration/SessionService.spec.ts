import { describe, it, expect, vi } from "vitest";
import { SessionService } from "../../../src/integration/SessionService";
import type { ApiClient } from "../../../src/integration/ApiClient";
import type { SessionUpdatePayload } from "../../../src/types/api";

describe("SessionService", () => {
  it("updates session via PUT with JSON payload", async () => {
    const payload: SessionUpdatePayload = {
      gameSessionDurationSeconds: 42,
      scoreAchieved: 9000,
      eventId: "evt-123",
    };

    const requestMock = vi.fn().mockResolvedValue({ success: true });

    const mockClient = {
      request: requestMock,
      resolveUrl: vi.fn().mockReturnValue(
        "https://api.test/collection/my-games/99/session-update"
      ),
    } as unknown as ApiClient;

    const service = new SessionService(mockClient);
    const response = await service.updateSession(99, payload);

    expect(requestMock).toHaveBeenCalledWith(
      "/collection/my-games/99/session-update",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    expect(response).toEqual({ success: true });
  });
});

