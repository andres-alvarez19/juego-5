import { describe, it, expect } from "vitest";
import { parseResponse, safeReadBody } from "../../../src/integration/response";

describe("response helpers", () => {
  it("parses JSON responses", async () => {
    const res = new Response(JSON.stringify({ a: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const parsed = await parseResponse<{ a: number }>(res);
    expect(parsed.a).toBe(1);
  });

  it("returns text when not json", async () => {
    const res = new Response("plain text", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });

    const parsed = await parseResponse<string>(res);
    expect(parsed).toBe("plain text");
  });

  it("handles empty body as undefined", async () => {
    const res = new Response(null, { status: 204 });
    const parsed = await parseResponse<undefined>(res);
    expect(parsed).toBeUndefined();
  });

  it("safeReadBody returns null on invalid parse", async () => {
    const res = new Response("not-json", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

    const body = await safeReadBody(res);
    // parse will fail and helper returns null
    expect(body).toBeNull();
  });
});
