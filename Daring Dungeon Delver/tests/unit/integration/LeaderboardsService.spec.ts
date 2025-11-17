import { describe, it, expect, vi } from "vitest";
import { LeaderboardsService } from "../../../src/integration/LeaderboardsService";
import type { ApiClient } from "../../../src/integration/ApiClient";

describe("LeaderboardsService", () => {
  it("fetches leaderboard using GET with encoded limit", async () => {
    const requestMock = vi.fn().mockResolvedValue({
      leaderboard: [],
    });

    const mockClient = {
      request: requestMock,
    } as unknown as ApiClient;

    const service = new LeaderboardsService(mockClient);
    const response = await service.getLeaderboard(123, 25);

    expect(requestMock).toHaveBeenCalledWith(
      "/collection/leaderboards/123?limit=25",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(response).toEqual({ leaderboard: [] });
  });
});

