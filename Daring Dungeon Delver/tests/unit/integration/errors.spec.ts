import { describe, it, expect } from "vitest";
import { ApiError } from "../../../src/integration/errors";
import { TEST_BASE_URL } from "../../support/test-urls";

describe("ApiError", () => {
  it("stores details and message", () => {
    const details = { endpoint: `${TEST_BASE_URL}/res`, attempts: 2 } as any;
    const err = new ApiError("fail", details);

    expect(err.message).toBe("fail");
    expect(err.name).toBe("ApiError");
    expect(err.details).toBe(details);
  });
});
